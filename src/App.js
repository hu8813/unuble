import React, { useState } from 'react';
import { Button, Container, Row, Col, Table, Toast, ToastContainer } from 'react-bootstrap';
import { FaLock, FaUnlock, FaBoxOpen, FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';
import { GiScooter } from 'react-icons/gi'; // Importing scooter icon

// Main service UUID
const SERVICE_UUID = "9a590000-6e67-5d0d-aab9-ad9126b66f91";

// UUIDs for writable characteristics with icons
const writableCharacteristics = {
  "9a590001-6e67-5d0d-aab9-ad9126b66f91": [
    { command: "scooter:state lock", icon: <FaLock /> },
    { command: "scooter:state unlock", icon: <FaUnlock /> },
    { command: "scooter:seatbox open", icon: <FaBoxOpen /> },
    { command: "scooter:blinker right", icon: <FaArrowRight /> },
    { command: "scooter:blinker left", icon: <FaArrowLeft /> },
    { command: "scooter:blinker both", icon: <FaExclamationTriangle /> },
    { command: "scooter:blinker off", icon: <FaLightbulb /> }
  ],
  "9a590002-6e67-5d0d-aab9-ad9126b66f91": [
    { command: "hibernate", icon: <FaLock /> },
    { command: "wakeup", icon: <FaUnlock /> },
  ],
};

const readableCharacteristics = {
  "9a590020-6e67-5d0d-aab9-ad9126b66f91": { description: "Status of the scooter", values: ["stand-by", "off", "parked", "shutting-down", "ready-to-drive", "updating"] },
  "9a590022-6e67-5d0d-aab9-ad9126b66f91": { description: "Status of the seat box", values: ["open", "closed", "unknown"] },
  "9a590023-6e67-5d0d-aab9-ad9126b66f91": { description: "Handlebar lock status", values: ["locked", "unlocked"] },
  "9a590040-6e67-5d0d-aab9-ad9126b66f91": { description: "AUX battery voltage", isVoltage: true },
  "9a590043-6e67-5d0d-aab9-ad9126b66f91": { description: "AUX battery charge status", values: ["absorption-charge", "not-charging", "float-charge", "bulk-charge"] },
  "9a590044-6e67-5d0d-aab9-ad9126b66f91": { description: "AUX battery charge level", isPercentage: true },
  "9a590060-6e67-5d0d-aab9-ad9126b66f91": { description: "CB battery charge level", isPercentage: true },
  "9a590063-6e67-5d0d-aab9-ad9126b66f91": { description: "CB battery remaining capacity" },
  "9a590064-6e67-5d0d-aab9-ad9126b66f91": { description: "CB battery full capacity" },
  "9a590065-6e67-5d0d-aab9-ad9126b66f91": { description: "CB battery cell voltage in mV" },
  "9a590072-6e67-5d0d-aab9-ad9126b66f91": { description: "CB battery charge status", values: ["not-charging", "charging", "unknown"] },
  "9a590100-6e67-5d0d-aab9-ad9126b66f91": { description: "Battery type" },
  "9a5900a0-6e67-5d0d-aab9-ad9126b66f91": { description: "Power state", values: ["booting", "running", "suspending", "suspending-imminent", "hibernating-imminent", "hibernating"] },
  "9a5900e0-6e67-5d0d-aab9-ad9126b66f91": { description: "Primary battery state", values: ["unknown", "asleep", "active", "idle"] },
  "9a5900e3-6e67-5d0d-aab9-ad9126b66f91": { description: "Primary battery presence indicator" },
  "9a5900e6-6e67-5d0d-aab9-ad9126b66f91": { description: "Primary battery cycle count" },
  "9a5900e9-6e67-5d0d-aab9-ad9126b66f91": { description: "Primary battery state of charge", isPercentage: true },
  "9a5900ee-6e67-5d0d-aab9-ad9126b66f91": { description: "Secondary battery state", values: ["unknown", "asleep", "active", "idle"] },
  "9a5900ef-6e67-5d0d-aab9-ad9126b66f91": { description: "Secondary battery presence indicator" },
  "9a5900f2-6e67-5d0d-aab9-ad9126b66f91": { description: "Secondary battery cycle count" },
  "9a5900f5-6e67-5d0d-aab9-ad9126b66f91": { description: "Secondary battery state of charge", isPercentage: true },
  "9a59a000-6e67-5d0d-aab9-ad9126b66f91": { description: "nRF version" },
  "9a59a020-6e67-5d0d-aab9-ad9126b66f91": { description: "Reset reason" },
  "9a59a022-6e67-5d0d-aab9-ad9126b66f91": { description: "Reset count" },
};

const App = () => {
  const [characteristicsList, setCharacteristicsList] = useState([]); // Store all characteristics and values
  const [connected, setConnected] = useState(false);
  const [device, setDevice] = useState(null); // Store the device for reuse
  const [gattServer, setGattServer] = useState(null); // Store the GATT server for reuse
  const [service, setService] = useState(null); // Store the service for reuse
  const [toastMessage, setToastMessage] = useState(''); // Toast message for notifications

  // Connect to the device and retrieve the service
  const connectToScooter = async () => {
    try {
      let scooterDevice = device;
      if (!scooterDevice) {
        scooterDevice = await navigator.bluetooth.requestDevice({
          filters: [{ services: [SERVICE_UUID] }],
          optionalServices: [SERVICE_UUID],
        });
        setDevice(scooterDevice);
      }

      let gatt = gattServer;
      if (!gatt) {
        gatt = await scooterDevice.gatt.connect();
        setGattServer(gatt);
      }

      let scooterService = service;
      if (!scooterService) {
        scooterService = await gatt.getPrimaryService(SERVICE_UUID);
        setService(scooterService);
      }

      // Get all characteristics and read values
      const allCharacteristics = await getAllCharacteristics(scooterService);
      setCharacteristicsList(allCharacteristics);
      setConnected(true);
    } catch (error) {
      console.error("Error connecting to scooter:", error);
      setToastMessage("Failed to connect to the scooter.");
    }
  };

  // Fetch all characteristics and read their values
  const getAllCharacteristics = async (service) => {
    const characteristics = await service.getCharacteristics();
    const characteristicsData = [];

    for (const characteristic of characteristics) {
      let value = "N/A";
      const uuid = characteristic.uuid;

      // If readable, read the characteristic's value
      if (characteristic.properties.read) {
        const rawValue = await characteristic.readValue();
        value = decodeValue(rawValue);

        // Special handling for characteristics with predefined values
        if (readableCharacteristics[uuid]) {
          const { isPercentage, isVoltage, values } = readableCharacteristics[uuid];
          if (isPercentage) {
            value = `${value}%`;
          } else if (isVoltage) {
            value = `${value} mV`;
          } else if (values) {
            value = values[value] || value; // Match the value to the description
          }
        }
      }

      characteristicsData.push({
        uuid,
        value,
        description: readableCharacteristics[uuid]?.description || "Unknown",
      });
    }

    return characteristicsData;
  };

  // Decode the value from the characteristic
  const decodeValue = (rawValue) => {
    if (!rawValue) return "N/A";

    // Convert the buffer to a number, taking into account the type of characteristic
    return rawValue.getUint8(0); // Assuming the values are stored as uint8 for simplicity
  };

  // Handle the connection
  const handleConnect = () => {
    connectToScooter();
  };

  return (
    <Container>
      <h1>Scooter Dashboard <GiScooter /></h1>
      <Button onClick={handleConnect} disabled={connected}>Connect</Button>

      <ToastContainer position="top-center" className="p-3">
        <Toast show={!!toastMessage} onClose={() => setToastMessage('')}>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Row>
        <Col>
          <h3>Characteristics</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>UUID</th>
                <th>Description</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {characteristicsList.map(({ uuid, description, value }) => (
                <tr key={uuid}>
                  <td>{uuid}</td>
                  <td>{description}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
