import React, { useState } from 'react';
import { Button, Container, Row, Col, Table, Toast, ToastContainer } from 'react-bootstrap';
import { FaLock, FaUnlock, FaBoxOpen, FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';
import { GiScooter } from 'react-icons/gi'; // Importing scooter icon

// Main service UUID
const MAIN_SERVICE_UUID = "9a590000-6e67-5d0d-aab9-ad9126b66f91";

// List of all possible service UUIDs for optionalServices
const OPTIONAL_SERVICES = [
    "9a590001-6e67-5d0d-aab9-ad9126b66f91",
    "9a590002-6e67-5d0d-aab9-ad9126b66f91",
    "9a590010-6e67-5d0d-aab9-ad9126b66f91",
    "9a590020-6e67-5d0d-aab9-ad9126b66f91",
    "9a590021-6e67-5d0d-aab9-ad9126b66f91",
    "9a590022-6e67-5d0d-aab9-ad9126b66f91",
    // Add more service UUIDs as needed
];

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

// Complete readable characteristics
const readableCharacteristics = {
    "9a590020-6e67-5d0d-aab9-ad9126b66f91": { description: "Scooter Status", values: ["stand-by", "off", "parked", "shutting-down", "ready-to-drive", "updating"] },
    "9a590021-6e67-5d0d-aab9-ad9126b66f91": { description: "Battery Level", isPercentage: true }, // Example of percentage
    "9a590022-6e67-5d0d-aab9-ad9126b66f91": { description: "Voltage", isVoltage: true }, // Example of voltage
    // You can add more readable characteristics as needed.
};

const App = () => {
    const [characteristicsList, setCharacteristicsList] = useState([]); // Store all characteristics and values
    const [connected, setConnected] = useState(false);
    const [device, setDevice] = useState(null); // Store the device for reuse
    const [gattServer, setGattServer] = useState(null); // Store the GATT server for reuse
    const [toastMessage, setToastMessage] = useState(''); // Toast message for notifications

    // Connect to the device and retrieve the services
    const connectToScooter = async () => {
        try {
            // Check if device is already connected
            if (device && gattServer && gattServer.connected) {
                setToastMessage("Already connected to the scooter.");
                return;
            }

            let scooterDevice = device;
            if (!scooterDevice) {
                scooterDevice = await navigator.bluetooth.requestDevice({
                    filters: [{ services: [MAIN_SERVICE_UUID] }],
                    optionalServices: OPTIONAL_SERVICES, // Add all optional services here
                });
                setDevice(scooterDevice);
            }

            let gatt = gattServer;
            if (!gatt) {
                gatt = await scooterDevice.gatt.connect();
                setGattServer(gatt);
            }

            // Get all characteristics from the main service and any additional services
            const allCharacteristics = await getAllCharacteristics(gatt);
            setCharacteristicsList(allCharacteristics);
            setConnected(true);
        } catch (error) {
            console.error("Error connecting to scooter:", error);
            setToastMessage("Failed to connect to the scooter.");
        }
    };

    // Fetch characteristics from all services
    const getAllCharacteristics = async (gatt) => {
        const characteristicsData = [];
        const mainService = await gatt.getPrimaryService(MAIN_SERVICE_UUID);
        characteristicsData.push(...await fetchCharacteristics(mainService));

        // Fetch characteristics from dynamic services based on UUIDs
        for (let i = 0; i <= 2; i++) { // Adjust the loop count based on how many services you expect
            const serviceUUID = `9a5900${i}0-6e67-5d0d-aab9-ad9126b66f91`;
            try {
                const service = await gatt.getPrimaryService(serviceUUID);
                characteristicsData.push(...await fetchCharacteristics(service));
            } catch (error) {
                console.error(`Service ${serviceUUID} not found`, error);
            }
        }

        return characteristicsData;
    };

    // Helper function to fetch characteristics from a service
    const fetchCharacteristics = async (service) => {
        const characteristics = await service.getCharacteristics();
        const characteristicsData = [];

        for (const characteristic of characteristics) {
            const uuid = characteristic.uuid;
            let value = "N/A";

            // If readable, read the characteristic's value
            if (characteristic.properties.read) {
                const rawValue = await characteristic.readValue();
                value = decodeValue(rawValue);

                // Special handling for characteristics with predefined values
                if (readableCharacteristics[uuid]) {
                    const { values, isPercentage, isVoltage } = readableCharacteristics[uuid];
                    if (isPercentage) {
                        value = `${value}%`;
                    } else if (isVoltage) {
                        value = `${value} mV`;
                    } else if (values) {
                        value = values[parseInt(value, 10)] || "Unknown";
                    }
                }
            }

            characteristicsData.push({
                uuid: uuid,
                value: value,
                description: readableCharacteristics[uuid]?.description || "Unknown characteristic",
            });
        }
        return characteristicsData;
    };

    // Decode the raw value from characteristic
    const decodeValue = (rawValue) => {
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(rawValue);
    };

    // Handle writing to a writable characteristic
    const writeCharacteristic = async (uuid, value) => {
        try {
            const serviceUUID = uuid.replace(/.$/, '0'); // Get the corresponding service UUID
            const characteristic = await gattServer.getPrimaryService(serviceUUID).getCharacteristic(uuid);
            const encoder = new TextEncoder('utf-8');
            await characteristic.writeValue(encoder.encode(value));
            setToastMessage(`Command "${value}" sent to characteristic "${uuid}".`);
        } catch (error) {
            console.error("Error writing to characteristic:", error);
            setToastMessage("Failed to send command.");
        }
    };

    // Close the connection
    const disconnectScooter = async () => {
        if (gattServer) {
            await gattServer.disconnect();
            setConnected(false);
            setDevice(null);
            setGattServer(null);
            setCharacteristicsList([]);
            setToastMessage("Disconnected from scooter.");
        }
    };

    return (
        <Container>
            <h1 className="text-center my-4"><GiScooter /> Scooter Control Panel</h1>
            <Button onClick={connectToScooter} variant="primary" className="mb-3" disabled={connected}>
                {connected ? "Connected" : "Connect to Scooter"}
            </Button>
            {connected && (
                <>
                    <Button onClick={disconnectScooter} variant="danger" className="mb-3">
                        Disconnect
                    </Button>
                    <Row>
                        <Col>
                            <h2>Readable Characteristics</h2>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>UUID</th>
                                        <th>Description</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {characteristicsList.filter(char => readableCharacteristics[char.uuid]).map((char, index) => (
                                        <tr key={char.uuid}> {/* Ensure unique key */}
                                            <td>{char.uuid}</td>
                                            <td>{readableCharacteristics[char.uuid].description}</td>
                                            <td>{char.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                        <Col>
                            <h2>Writable Characteristics</h2>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Command</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(writableCharacteristics).flatMap(uuid => 
                                        writableCharacteristics[uuid].map(({ command, icon }, index) => (
                                            <tr key={`${uuid}-${index}`}> {/* Ensure unique key */}
                                                <td>{icon} {command}</td>
                                                <td>
                                                    <Button onClick={() => writeCharacteristic(uuid, command)} variant="success">
                                                        Send
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </>
            )}
            <ToastContainer position="top-center">
                <Toast onClose={() => setToastMessage('')} show={!!toastMessage} delay={3000} autohide>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
};

export default App;
