import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * רכיב Custom שמעדכן את תצוגת המפה בהתבסס על המרכז (center) שסופק.
 * @param {Object} props - פרופס של הרכיב.
 * @param {Array} props.center - מערך הכולל את הקואורדינטות (latitude, longitude) למרכז המפה.
 */
const UpdateMapView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom()); // עדכון המיקום על גבי המפה לפי הקואורדינטות החדשות.
        }
    }, [center, map]);
    return null;
};

/**
 * קומפוננטת Map מציגה מפה עם מיקום מבוסס קואורדינטות שסופקו.
 * @param {Object} props - פרופס של הרכיב.
 * @param {string} props.lat - קו רוחב (latitude) של המיקום.
 * @param {string} props.lon - קו אורך (longitude) של המיקום.
 */
const Map = ({ lat, lon }) => {
    const [position, setPosition] = useState(null); // מצב לשמירת המיקום הנוכחי.

    /**
     * אפקט שמתעדכן כאשר הערכים של lat ו-lon משתנים.
     * אם הערכים תקינים, העמדה (position) תתעדכן.
     */
    useEffect(() => {
        if (lat && lon) {
            setPosition([lat, lon]); // קביעת המיקום במערך הכולל קו רוחב ואורך.
        }
    }, [lat, lon]);

    return (
        <div style={{ height: '500px', width: '100%' }}>
            {position ? (
                <MapContainer
                    center={position}
                    zoom={16}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    {/* שכבת אריחים להצגת מפה */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* רכיב לעדכון תצוגת המפה */}
                    <UpdateMapView center={position} />
                    {/* סימון מיקום (Marker) */}
                    <Marker position={position}>
                        <Popup>
                            A pretty CSS3 popup. <br /> Easily customizable.
                        </Popup>
                    </Marker>
                </MapContainer>
            ) : (
                <p>Loading map...</p> // הודעת טעינה כאשר אין מיקום זמין.
            )}
        </div>
    );
};

export default Map;
