import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TeacherFinder.css';
import logo from '../assets/logo.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const TeacherFinder = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [allTeachers, setAllTeachers] = useState([]);

  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'teachers'));
        const teachersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            latitude: data.location?.lat,
            longitude: data.location?.lng,
          };
        });
        setAllTeachers(teachersData);
        setTeachers(teachersData); // Initialize the displayed list with all teachers
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchAllTeachers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setTeachers(allTeachers);
      return;
    }

    const filtered = allTeachers.filter(teacher =>
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTeachers(filtered);
    setSelectedTeacher(null);
  }, [searchTerm, allTeachers]);

  const handleViewOnMap = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const openInOpenStreetMap = () => {
    if (!selectedTeacher?.latitude || !selectedTeacher?.longitude) return;
    window.open(
      `https://www.openstreetmap.org/?mlat=${selectedTeacher.latitude}&mlon=${selectedTeacher.longitude}#map=16/${selectedTeacher.latitude}/${selectedTeacher.longitude}`
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'free': return 'green';
      case 'class': return 'orange';
      case 'busy': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="teacher-finder-layout">
      <div className="sidebar">
        <img src={logo} alt="Project Logo" className="project-logo" />
        <h1 className="main-title">🎓 Locate My Professor</h1>

        <input
          className="search-box"
          type="text"
          placeholder="Search Professor Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="teacher-list">
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <div className="teacher-card" key={teacher.id}>
                <div className="teacher-details">
                  <span className={`status-light ${getStatusColor(teacher.status)}`}></span>
                  <div>
                    <h3>{teacher.name}</h3>
                    <p>Status:<b> {teacher.status}</b></p>
                    <p className="teacher-room">Room:<b> {teacher.room}</b></p>
                  </div>
                </div>
                <button onClick={() => handleViewOnMap(teacher)}>📍 View Location</button>
              </div>
            ))
          ) : (
            searchTerm && <p className="no-results">No Professor found matching "{searchTerm}"</p>
          )}
        </div>
      </div>

      <div className="map-area">
        {selectedTeacher && selectedTeacher.latitude && selectedTeacher.longitude ? (
          <>
            <h2>{selectedTeacher.name}'s Location</h2>
            <MapContainer
              center={[selectedTeacher.latitude, selectedTeacher.longitude]}
              zoom={15}
              className="map-container"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={[selectedTeacher.latitude, selectedTeacher.longitude]}>
                <Popup>
                  {selectedTeacher.name} - {selectedTeacher.status}
                </Popup>
              </Marker>
            </MapContainer>
            <button className="open-map-btn" onClick={openInOpenStreetMap}>
              🌐 Open in OpenStreetMap
            </button>
          </>
        ) : (
          <p className="no-selection-msg">Select a professor to view their location</p>
        )}
      </div>
    </div>
  );
};

export default TeacherFinder;