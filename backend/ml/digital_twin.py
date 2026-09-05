"""
RAILCAST AI - Lightweight Railway Digital Twin
Maintains spatio-temporal network graph representation with NetworkX.
Computes Node Centrality, Section Bottleneck Scores, Network Pressure Index, and Delay Cascade potentials.
"""

import networkx as nx
import numpy as np

class RailwayDigitalTwin:
    def __init__(self, stations: dict, sections: list):
        self.graph = nx.DiGraph()
        self.stations = stations
        self.sections = sections
        self._build_graph()

    def _build_graph(self):
        for stn_code, stn_info in self.stations.items():
            self.graph.add_node(
                stn_code,
                name=stn_info["name"],
                lat=stn_info["lat"],
                lon=stn_info["lon"],
                corridor=stn_info["corridor"],
                platforms=stn_info["platforms"],
                congestion=stn_info["congestion_index"]
            )

        for sec in self.sections:
            self.graph.add_edge(
                sec["from_station"],
                sec["to_station"],
                section_id=sec["section_id"],
                distance_km=sec["distance_km"],
                max_speed=sec["max_speed_kmh"],
                tracks=sec["tracks"],
                capacity=sec["base_capacity"],
                congestion=sec["current_congestion"],
                weather=sec["weather"]
            )

        # Precompute centrality metrics
        self.degree_centrality = nx.degree_centrality(self.graph)
        try:
            self.betweenness_centrality = nx.betweenness_centrality(self.graph)
        except Exception:
            self.betweenness_centrality = {n: 0.1 for n in self.graph.nodes()}

    def get_network_state(self, active_trains_data: list):
        """
        Computes real-time Network State Snapshot:
        - Active trains count
        - Delayed trains count (arr_delay > 5 min)
        - Critical sections (congestion > 0.70 or heavy delay)
        - Average network delay
        - Network Pressure Index (0-100)
        """
        total_trains = len(active_trains_data)
        delayed_trains = [t for t in active_trains_data if t.get("arr_delay_min", 0) > 5.0]
        avg_delay = float(np.mean([t.get("arr_delay_min", 0) for t in active_trains_data])) if total_trains > 0 else 0.0

        # Critical sections
        high_congestion_sections = [s for s in self.sections if s["current_congestion"] >= 0.65]
        critical_sections = [s for s in self.sections if s["current_congestion"] >= 0.78 or s["weather"] in ["Heavy Rain", "Dense Fog", "Severe Storm"]]

        # Network Pressure Index Calculation (0 to 100 scale)
        delay_component = min(1.0, (avg_delay / 30.0)) * 40.0
        congestion_component = float(np.mean([s["current_congestion"] for s in self.sections])) * 40.0 if self.sections else 0.0
        critical_component = min(1.0, len(critical_sections) / max(1, len(self.sections) * 0.2)) * 20.0

        network_pressure = round(delay_component + congestion_component + critical_component, 1)
        network_pressure = min(100.0, max(0.0, network_pressure))

        return {
            "timestamp": active_trains_data[0]["act_arr"] if active_trains_data else "2026-09-05T10:00:00",
            "active_trains": total_trains,
            "delayed_trains": len(delayed_trains),
            "on_time_trains": total_trains - len(delayed_trains),
            "critical_sections": len(critical_sections),
            "high_congestion_sections": len(high_congestion_sections),
            "average_delay_min": round(avg_delay, 1),
            "network_pressure_index": network_pressure,
            "pressure_status": "CRITICAL" if network_pressure >= 75 else ("HIGH" if network_pressure >= 50 else ("WATCH" if network_pressure >= 30 else "LOW"))
        }

    def get_bottleneck_sections(self, active_trains_data: list, top_k: int = 5):
        """
        Calculates Section Criticality Score = f(traffic_density, centrality, congestion, avg_delay)
        """
        # Map delay per section
        sec_delays = {}
        sec_train_counts = {}
        for t in active_trains_data:
            sec_id = t.get("section_id")
            if sec_id:
                sec_delays[sec_id] = sec_delays.get(sec_id, []) + [t.get("arr_delay_min", 0)]
                sec_train_counts[sec_id] = sec_train_counts.get(sec_id, 0) + 1

        bottlenecks = []
        for sec in self.sections:
            sec_id = sec["section_id"]
            u, v = sec["from_station"], sec["to_station"]
            betweenness = (self.betweenness_centrality.get(u, 0) + self.betweenness_centrality.get(v, 0)) / 2.0
            
            delays = sec_delays.get(sec_id, [0.0])
            avg_sec_delay = float(np.mean(delays))
            active_count = sec_train_counts.get(sec_id, 0)

            # Score formulation
            criticality_score = (
                (sec["current_congestion"] * 35.0) +
                (betweenness * 100.0 * 25.0) +
                (min(1.0, avg_sec_delay / 45.0) * 25.0) +
                (min(1.0, active_count / 10.0) * 15.0)
            )
            criticality_score = round(min(100.0, criticality_score), 1)

            bottlenecks.append({
                "section_id": sec_id,
                "from_station": u,
                "from_station_name": self.stations[u]["name"],
                "to_station": v,
                "to_station_name": self.stations[v]["name"],
                "criticality_score": criticality_score,
                "current_congestion": sec["current_congestion"],
                "average_delay_min": round(avg_sec_delay, 1),
                "active_trains_count": active_count,
                "weather": sec["weather"],
                "risk_level": "CRITICAL" if criticality_score >= 70 else ("HIGH" if criticality_score >= 45 else "MEDIUM")
            })

        bottlenecks.sort(key=lambda x: x["criticality_score"], reverse=True)
        return bottlenecks[:top_k]

    def get_graph_export(self):
        """
        Returns JSON-serializable graph nodes and edges for frontend map/network canvas.
        """
        nodes = []
        for n, data in self.graph.nodes(data=True):
            nodes.append({
                "id": n,
                "code": n,
                "name": data["name"],
                "lat": data["lat"],
                "lon": data["lon"],
                "corridor": data["corridor"],
                "betweenness": round(self.betweenness_centrality.get(n, 0), 4),
                "platforms": data["platforms"],
                "congestion": data["congestion"]
            })

        edges = []
        for u, v, data in self.graph.edges(data=True):
            edges.append({
                "id": data["section_id"],
                "source": u,
                "target": v,
                "distance_km": data["distance_km"],
                "max_speed": data["max_speed"],
                "congestion": data["congestion"],
                "weather": data["weather"]
            })

        return {"nodes": nodes, "edges": edges}
