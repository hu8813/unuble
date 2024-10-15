import React, { useState, useEffect } from 'react';
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
      // Only request the device if we don't have it stored already
      let scooterDevice = device;
      if (!scooterDevice) {
        scooterDevice = await navigator.bluetooth.requestDevice({
          filters: [{ services: [SERVICE_UUID] }],
          optionalServices: [SERVICE_UUID],
        });
        setDevice(scooterDevice);
      }

      // Connect to the GATT server if not connected already
      let gatt = gattServer;
      if (!gatt) {
        gatt = await scooterDevice.gatt.connect();
        setGattServer(gatt);
      }

      // Retrieve the service if not retrieved already
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
    }
  };

  // Fetch all characteristics and read their values
  const getAllCharacteristics = async (service) => {
    const characteristics = await service.getCharacteristics();
    const characteristicsData = [];

    for (const characteristic of characteristics) {
      let value = "N/A";

      // If readable, read the characteristic's value
      if (characteristic.properties.read) {
        const rawValue = await characteristic.readValue();
        value = decodeValue(rawValue);
      }

      characteristicsData.push({
        uuid: characteristic.uuid,
        value,
        writable: characteristic.properties.write, // Check if it's writable
      });
    }

    return characteristicsData;
  };

  // Utility function to decode characteristic value
  const decodeValue = (value) => {
    // Convert raw value to human-readable format (e.g., UTF-8 or integer)
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(value);
  };

  // Function to handle writing a command to a writable characteristic
  const handleWriteCommand = async (uuid, command) => {
    try {
      // Use the existing service instead of reconnecting
      if (service) {
        const characteristic = await service.getCharacteristic(uuid);

        const encoder = new TextEncoder();
        const value = encoder.encode(command);

        await characteristic.writeValue(value);
        setToastMessage(`Command "${command}" sent successfully!`);
      } else {
        setToastMessage("Not connected to the scooter service.");
      }
    } catch (error) {
      console.error("Error writing command:", error);
      setToastMessage(`Failed to send command: ${error.message}`);
    }
  };

  return (
    <Container fluid="md" className="mt-4">
      <Row>
        <Col>
          <h1><GiScooter style={{ marginRight: "10px" }} />UNU Scooter</h1> {/* Scooter icon */}
          <Button variant="primary" onClick={connectToScooter}>
            {connected ? 'Connected' : 'Connect to UNU Scooter'}
          </Button>
        </Col>
      </Row>

      {connected && (
        <Row className="mt-3">
          <Col>
            <h4>Characteristics</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>UUID</th>
                  <th>Value</th>
                  <th>Write Commands</th>
                </tr>
              </thead>
              <tbody>
                {characteristicsList.map((char, index) => (
                  <tr key={index}>
                    <td>{char.uuid}</td>
                    <td>{char.value}</td>
                    <td>
                      {writableCharacteristics[char.uuid] ? (
                        <div className="d-flex">
                          {writableCharacteristics[char.uuid].map((cmd, idx) => (
                            <Button
                              key={idx}
                              variant="outline-secondary"
                              className="me-2"
                              onClick={() => handleWriteCommand(char.uuid, cmd.command)}
                            >
                              {cmd.icon} {cmd.command}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      )}

      {/* Toast notification */}
      <ToastContainer position="bottom-end" className="p-3">
        <Toast onClose={() => setToastMessage('')} show={!!toastMessage} delay={3000} autohide>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default App;
