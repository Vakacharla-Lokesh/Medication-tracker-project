import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [medications, setMedications] = useState([]);
  const [medicationLog, setMedicationLog] = useState([]);
  const [newMedication, setNewMedication] = useState({});

  useEffect(() => {
    axios.get('/medications')
      .then(response => {
        setMedications(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const handleCreateMedication = async () => {
    try {
      const response = await axios.post('/medications', newMedication);
      setMedications([...medications, response.data]);
      setNewMedication({});
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogMedication = async (medicationId) => {
    try {
      const response = await axios.post('/medication_log', { medication_id: medicationId });
      setMedicationLog([...medicationLog, response.data]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Medication Tracker</h1>
      <form>
        <label >
          Name:
          <input type="text" value={newMedication.name} onChange={e => setNewMedication({ ...newMedication, name: e.target.value })} />
        </label>
        <label>
          Dosage:
          <input type="text" value={newMedication.dosage} onChange={e => setNewMedication({ ...newMedication, dosage: e.target.value })} />
        </label>
        <label>
          Frequency:
          <input type="text" value={newMedication.frequency} onChange={e => setNewMedication({ ...newMedication, frequency: e.target.value })} />
        </label>
        <label>
          Duration:
          <input type="text" value={newMedication.duration} onChange={e => setNewMedication({ ...newMedication, duration: e.target.value })} />
        </label>
        <button onClick={handleCreateMedication}>Create Medication</button>
      </form>
      <ul>
        {medications.map(medication => (
          <li key={medication.id}>
            {medication.name} ({medication.dosage} {medication.frequency} {medication.duration})
            <button onClick={() => handleLogMedication(medication.id)}>Log Medication</button>
          </li>
        ))}
      </ul>
      <h2>Medication Log</h2>
      <ul>
        {medicationLog.map(log => (
          <li key={log.id}>
            {log.medication.name} taken at {log.taken_at}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;