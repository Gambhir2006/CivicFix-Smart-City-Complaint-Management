import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import { getPublicComplaints } from "../services/complaintService";

function Heatmap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await getPublicComplaints();
      setComplaints(data.filter(c => c.latitude && c.longitude));
    } catch (error) {
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const getColorByCategory = (category) => {
    const colors = {
      "Garbage": "#ff0000",
      "Road Damage": "#ff6600",
      "Water Leakage": "#0066ff",
      "Streetlight": "#ffff00",
      "Drainage": "#6600ff",
      "Public Sanitation": "#ff00ff",
      "Other": "#808080"
    };
    return colors[category] || "#808080";
  };

  const filteredComplaints = filter === "all"
    ? complaints
    : complaints.filter(c => c.category === filter);

  const categories = [...new Set(complaints.map(c => c.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Loading heatmap...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400">Complaint Heatmap</h1>
          <a
            href="/"
            className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
          >
            Back to Home
          </a>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Filter by Category
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
          <div className="flex gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">Garbage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm">Road Damage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm">Water Leakage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Streetlight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span className="text-sm">Drainage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-pink-500"></div>
              <span className="text-sm">Public Sanitation</span>
            </div>
          </div>

          <div className="h-[600px] rounded-lg overflow-hidden border border-slate-700">
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredComplaints.map((complaint) => (
                <CircleMarker
                  key={complaint.id}
                  center={[complaint.latitude, complaint.longitude]}
                  radius={1000}
                  pathOptions={{
                    color: getColorByCategory(complaint.category),
                    fillColor: getColorByCategory(complaint.category),
                    fillOpacity: 0.3,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-slate-900">
                      <h3 className="font-bold">{complaint.title}</h3>
                      <p className="text-sm">{complaint.description}</p>
                      <p className="text-xs mt-2">
                        <strong>Category:</strong> {complaint.category}<br />
                        <strong>Status:</strong> {complaint.status}<br />
                        <strong>Code:</strong> {complaint.complaint_code}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Total Complaints with Location</p>
              <p className="text-2xl font-bold text-cyan-400">{complaints.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Currently Displayed</p>
              <p className="text-2xl font-bold text-green-400">{filteredComplaints.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-purple-400">{categories.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Most Common Category</p>
              <p className="text-2xl font-bold text-orange-400">
                {categories.length > 0
                  ? Object.entries(
                      complaints.reduce((acc, c) => {
                        acc[c.category] = (acc[c.category] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort((a, b) => b[1] - a[1])[0][0]
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
