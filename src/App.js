import React, { useState } from 'react';
import { Button, Container, Row, Col, Table, Toast, ToastContainer } from 'react-bootstrap';
import { FaLock, FaUnlock, FaBoxOpen, FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';
import { GiScooter } from 'react-icons/gi'; // Importing scooter icon

// Main service UUID
const MAIN_SERVICE_UUID = "9a590000-6e67-5d0d-aab9-ad9126b66f91";

// List of all possible service UUIDs for optionalServices
const OPTIONAL_SERVICES = [
    "00001800-0000-1000-8000-00805f9b34fb", // Generic Access
    "00001801-0000-1000-8000-00805f9b34fb", // Generic Attribute
    "9a590000-6e67-5d0d-aab9-ad9126b66f91",
    "9a590020-6e67-5d0d-aab9-ad9126b66f91",
    "9a590040-6e67-5d0d-aab9-ad9126b66f91",
    "9a590060-6e67-5d0d-aab9-ad9126b66f91",
    "9a5900a0-6e67-5d0d-aab9-ad9126b66f91",
    "9a5900e0-6e67-5d0d-aab9-ad9126b66f91",
    "9a590100-6e67-5d0d-aab9-ad9126b66f91",
    "9a59a000-6e67-5d0d-aab9-ad9126b66f91",
    "9a59a020-6e67-5d0d-aab9-ad9126b66f91"
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

// Complete readable characteristics with their respective service UUIDs
const readableCharacteristics = {
    // Proprietary Service 1
    "9a590021-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Battery Level", 
        values: ["stand-by", "off", "parked", "shutting-down", "ready-to-drive", "updating"] 
    },
    "9a590022-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Voltage", 
        isVoltage: true 
    },
    "9a590023-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Seat Box Status", 
        values: ["open", "closed", "unknown"] 
    },

    // Proprietary Service 2
    "9a590041-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "AUX Battery Voltage", 
        isVoltage: true 
    },
    "9a590043-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "AUX Battery Charge Status", 
        values: ["absorption-charge", "not-charging", "float-charge", "bulk-charge"] 
    },
    "9a590044-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "AUX Battery Charge Level", 
        isPercentage: true 
    },

    // Proprietary Service 3
    "9a590061-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "CB Battery Charge Level", 
        isPercentage: true 
    },
    "9a590063-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "CB Battery Remaining Capacity", 
        isCapacity: true 
    },
    "9a590064-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "CB Battery Full Capacity", 
        isCapacity: true 
    },
    "9a590065-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "CB Battery Cell Voltage", 
        isVoltage: true 
    },
    "9a590072-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "CB Battery Charge Status", 
        values: ["not-charging", "charging", "unknown"] 
    },

    // Proprietary Service 4
    "9a590101-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Battery Type", 
        values: ["cbb", "aux"] // Assume more values can be added if known
    },

    // Proprietary Service 5
    "9a5900a1-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Power State", 
        values: ["booting", "running", "suspending", "suspending-imminent", "hibernating-imminent", "hibernating"] 
    },

    // Proprietary Service 6
    "9a5900e2-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Primary Battery State", 
        values: ["unknown", "asleep", "active", "idle"] 
    },
    "9a5900e3-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Primary Battery Presence Indicator", 
        values: ["1", "0"] // Assume 1 means present, 0 means not present
    },
    "9a5900e6-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Primary Battery Cycle Count", 
        isCount: true 
    },
    "9a5900e9-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Primary Battery State of Charge", 
        isPercentage: true 
    },

    // Proprietary Service 7
    "9a5900ee-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Secondary Battery State", 
        values: ["unknown", "asleep", "active", "idle"] 
    },
    "9a5900ef-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Secondary Battery Presence Indicator", 
        values: ["1", "0"] 
    },
    "9a5900f2-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Secondary Battery Cycle Count", 
        isCount: true 
    },
    "9a5900f5-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Secondary Battery State of Charge", 
        isPercentage: true 
    },

    // Proprietary Service 8
    "9a59a001-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "nRF Version", 
        isVersion: true 
    },
    "9a59a021-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Reset Reason", 
        isReason: true 
    },
    "9a59a022-6e67-5d0d-aab9-ad9126b66f91": { 
        description: "Reset Count", 
        isCount: true 
    }
};

const App = () => {
    const [gattServer, setGattServer] = useState(null);
    const [connected, setConnected] = useState(false);
    const [characteristicsList, setCharacteristicsList] = useState([]);
    const [toastMessage, setToastMessage] = useState('');

    const connectToScooter = async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: OPTIONAL_SERVICES }]
            });
            const server = await device.gatt.connect();
            setGattServer(server);
            setConnected(true);
            const characteristics = await getAllCharacteristics(server);
            setCharacteristicsList(characteristics);
        } catch (error) {
            console.error('Connection failed', error);
            setToastMessage('Connection failed!');
        }
    };

    const getAllCharacteristics = async (gattServer) => {
        const services = await gattServer.getPrimaryServices();
        const characteristicsData = [];

        for (const service of services) {
            const characteristics = await service.getCharacteristics();

            for (const characteristic of characteristics) {
                const { uuid } = characteristic;
                const rawValue = await characteristic.readValue();

                let value = decodeValue(rawValue);
                // Check if this characteristic has predefined values
                if (readableCharacteristics[uuid]) {
                    const values = readableCharacteristics[uuid].values;
                    if (values) {
                        value = values[rawValue.getUint8(0)]; // Example for enumerated values
                    }
                }

                characteristicsData.push({ uuid, value });
            }
        }

        return characteristicsData;
    };

    // Decode the raw value from characteristic
    const decodeValue = (rawValue) => {
        return rawValue.getUint8(0); // Adjust this based on your data structure
    };

    // Write characteristic value based on command
    const writeCharacteristic = async (uuid, command) => {
        if (!gattServer) return;

        const service = await gattServer.getPrimaryService(MAIN_SERVICE_UUID);
        const characteristic = await service.getCharacteristic(uuid);
        const encoder = new TextEncoder('utf-8');
        await characteristic.writeValue(encoder.encode(command));
        setToastMessage(`Sent command: ${command}`);
    };

    return (
        <Container>
            <h1>Scooter Dashboard</h1>
            <Button onClick={connectToScooter} variant="primary">Connect</Button>
            {connected && (
                <>
                    <Button onClick={() => gattServer.disconnect()} variant="danger">Disconnect</Button>
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
                                    {characteristicsList.filter(char => readableCharacteristics[char.uuid]).map((char) => (
                                        <tr key={char.uuid}>
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
                                            <tr key={`${uuid}-${index}`}>
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
