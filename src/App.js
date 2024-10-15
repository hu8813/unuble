import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Table, Dropdown } from 'react-bootstrap';

// Main service UUID
const SERVICE_UUID = "9a590000-6e67-5d0d-aab9-ad9126b66f91";

// UUIDs for writable characteristics
const writableCharacteristics = {
  "9a590001-6e67-5d0d-aab9-ad9126b66f91": [
    "scooter:state lock",
    "scooter:state unlock",
    "scooter:seatbox open",
    "scooter:blinker right",
    "scooter:blinker left",
    "scooter:blinker both",
    "scooter:blinker off"
  ],
  "9a590002-6e67-5d0d-aab9-ad9126b66f91": ["hibernate", "wakeup"],
};

const App = () => {
  const [characteristicsList, setCharacteristicsList] = useState([]); // Store all characteristics and values
  const [connected, setConnected] = useState(false);
  const [device, setDevice] = useState(null); // Store the device for reuse
  const [gattServer, setGattServer] = useState(null); // Store the GATT server for reuse
  const [service, setService] = useState(null); // Store the service for reuse

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
        alert(`Command "${command}" sent successfully to characteristic ${uuid}`);
      } else {
        alert("Not connected to the scooter service.");
      }
    } catch (error) {
      console.error("Error writing command:", error);
      alert(`Failed to send command: ${error.message}`);
    }
  };

  return (
    <Container fluid="md" className="mt-4">
      <Row>
        <Col>
          <h1>UNU Scooter</h1>
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
                  <th>Values</th>
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
                        <Dropdown>
                          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                            Select Command
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {writableCharacteristics[char.uuid].map((command, idx) => (
                              <Dropdown.Item
                                key={idx}
                                onClick={() => handleWriteCommand(char.uuid, command)}
                              >
                                {command}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
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
    </Container>
  );
};

export default App;
