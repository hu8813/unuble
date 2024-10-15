import React, { useState } from 'react';
import { Button, Container, Row, Col, Table, Toast, ToastContainer } from 'react-bootstrap';
import { FaLock, FaUnlock, FaBoxOpen, FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';

// Service UUIDs
const servicesUUIDs = {
  inputControl: "9a590000-6e67-5d0d-aab9-ad9126b66f91",
  hibernationControl: "9a590002-6e67-5d0d-aab9-ad9126b66f91",
  status: "9a590020-6e67-5d0d-aab9-ad9126b66f91",
  seatBox: "9a590022-6e67-5d0d-aab9-ad9126b66f91",
  handlebarLock: "9a590023-6e67-5d0d-aab9-ad9126b66f91",
  auxBatteryVoltage: "9a590040-6e67-5d0d-aab9-ad9126b66f91",
  auxBatteryStatus: "9a590043-6e67-5d0d-aab9-ad9126b66f91",
  auxBatteryChargeLevel: "9a590044-6e67-5d0d-aab9-ad9126b66f91",
  cbBatteryChargeLevel: "9a590060-6e67-5d0d-aab9-ad9126b66f91",
  cbBatteryCapacity: "9a590063-6e67-5d0d-aab9-ad9126b66f91",
  cbBatteryFullCapacity: "9a590064-6e67-5d0d-aab9-ad9126b66f91",
  cbBatteryCellVoltage: "9a590065-6e67-5d0d-aab9-ad9126b66f91",
  cbBatteryChargeStatus: "9a590072-6e67-5d0d-aab9-ad9126b66f91",
  batteryType: "9a590100-6e67-5d0d-aab9-ad9126b66f91",
  powerState: "9a5900a0-6e67-5d0d-aab9-ad9126b66f91",
  primaryBatteryState: "9a5900e0-6e67-5d0d-aab9-ad9126b66f91",
  primaryBatteryPresence: "9a5900e3-6e67-5d0d-aab9-ad9126b66f91",
  primaryBatteryCycleCount: "9a5900e6-6e67-5d0d-aab9-ad9126b66f91",
  primaryBatteryStateOfCharge: "9a5900e9-6e67-5d0d-aab9-ad9126b66f91",
  secondaryBatteryState: "9a5900ee-6e67-5d0d-aab9-ad9126b66f91",
  secondaryBatteryPresence: "9a5900ef-6e67-5d0d-aab9-ad9126b66f91",
  secondaryBatteryCycleCount: "9a5900f2-6e67-5d0d-aab9-ad9126b66f91",
  secondaryBatteryStateOfCharge: "9a5900f5-6e67-5d0d-aab9-ad9126b66f91",
  nRFVersion: "9a59a000-6e67-5d0d-aab9-ad9126b66f91",
  resetReason: "9a59a020-6e67-5d0d-aab9-ad9126b66f91",
  resetCount: "9a59a022-6e67-5d0d-aab9-ad9126b66f91",
};

// Characteristic definitions
const characteristics = {
  [servicesUUIDs.inputControl]: {
    description: "Input control channel for lock and blinker.",
    commands: [
      { command: "scooter:state lock", icon: <FaLock /> },
      { command: "scooter:state unlock", icon: <FaUnlock /> },
      { command: "scooter:seatbox open", icon: <FaBoxOpen /> },
      { command: "scooter:blinker right", icon: <FaArrowRight /> },
      { command: "scooter:blinker left", icon: <FaArrowLeft /> },
      { command: "scooter:blinker both", icon: <FaExclamationTriangle /> },
      { command: "scooter:blinker off", icon: <FaLightbulb /> },
    ],
  },
  [servicesUUIDs.hibernationControl]: {
    description: "Input control channel for hibernation commands.",
    commands: [
      { command: "hibernate", icon: <FaLock /> },
      { command: "wakeup", icon: <FaUnlock /> },
    ],
  },
  [servicesUUIDs.status]: {
    description: "Status of the scooter.",
  },
  [servicesUUIDs.seatBox]: {
    description: "Status of the seat box.",
  },
  [servicesUUIDs.handlebarLock]: {
    description: "Handlebar lock status.",
  },
  [servicesUUIDs.auxBatteryVoltage]: {
    description: "AUX battery voltage.",
  },
  [servicesUUIDs.auxBatteryStatus]: {
    description: "AUX battery charge status.",
  },
  [servicesUUIDs.auxBatteryChargeLevel]: {
    description: "AUX battery charge level.",
  },
  [servicesUUIDs.cbBatteryChargeLevel]: {
    description: "CB battery charge level.",
  },
  [servicesUUIDs.cbBatteryCapacity]: {
    description: "CB battery remaining capacity.",
  },
  [servicesUUIDs.cbBatteryFullCapacity]: {
    description: "CB battery full capacity.",
  },
  [servicesUUIDs.cbBatteryCellVoltage]: {
    description: "CB battery cell voltage in mV.",
  },
  [servicesUUIDs.cbBatteryChargeStatus]: {
    description: "CB battery charge status.",
  },
  [servicesUUIDs.batteryType]: {
    description: "Battery type.",
  },
  [servicesUUIDs.powerState]: {
    description: "Power state.",
  },
  [servicesUUIDs.primaryBatteryState]: {
    description: "Primary battery state.",
  },
  [servicesUUIDs.primaryBatteryPresence]: {
    description: "Primary battery presence indicator.",
  },
  [servicesUUIDs.primaryBatteryCycleCount]: {
    description: "Primary battery cycle count.",
  },
  [servicesUUIDs.primaryBatteryStateOfCharge]: {
    description: "Primary battery state of charge.",
  },
  [servicesUUIDs.secondaryBatteryState]: {
    description: "Secondary battery state.",
  },
  [servicesUUIDs.secondaryBatteryPresence]: {
    description: "Secondary battery presence indicator.",
  },
  [servicesUUIDs.secondaryBatteryCycleCount]: {
    description: "Secondary battery cycle count.",
  },
  [servicesUUIDs.secondaryBatteryStateOfCharge]: {
    description: "Secondary battery state of charge.",
  },
  [servicesUUIDs.nRFVersion]: {
    description: "nRF version.",
  },
  [servicesUUIDs.resetReason]: {
    description: "Reset reason.",
  },
  [servicesUUIDs.resetCount]: {
    description: "Reset count.",
  },
};

const App = () => {
  const [device, setDevice] = useState(null);
  const [characteristicsList, setCharacteristicsList] = useState([]);
  const [writableCharacteristics, setWritableCharacteristics] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const connectToDevice = async () => {
    try {
      console.log("Requesting Bluetooth Device...");
      const options = { filters: [{ services: Object.values(servicesUUIDs) }] };
      const bluetoothDevice = await navigator.bluetooth.requestDevice(options);
      console.log("Device selected: ", bluetoothDevice.name);
      
      const server = await bluetoothDevice.gatt.connect();
      console.log("Connected to GATT Server: ", server);
      
      setDevice(bluetoothDevice);
      await getAllCharacteristics(server);
    } catch (error) {
      console.error("Bluetooth connection error: ", error);
      
      // Enhanced error messages based on error type
      if (error instanceof DOMException) {
        if (error.code === 19) {
          setToastMessage("Bluetooth device not found. Make sure it's powered on and in range.");
        } else {
          setToastMessage(`Connection error: ${error.message}`);
        }
      } else {
        setToastMessage(`An unexpected error occurred: ${error.message}`);
      }
    }
  };

  const getAllCharacteristics = async (server) => {
    const characteristicsArray = [];
    const writableChars = {};

    for (const serviceUUID of Object.values(servicesUUIDs)) {
      const service = await server.getPrimaryService(serviceUUID);
      const characteristics = await service.getCharacteristics();

      for (const characteristic of characteristics) {
        characteristicsArray.push({ characteristic, serviceUUID });

        // Check if the characteristic can be written to
        if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
          writableChars[serviceUUID] = writableChars[serviceUUID] || [];
          writableChars[serviceUUID].push(characteristic);
        }
      }
    }

    setCharacteristicsList(characteristicsArray);
    setWritableCharacteristics(writableChars);
  };

  const writeCharacteristic = async (serviceUUID, command) => {
    try {
      const service = await device.gatt.getPrimaryService(serviceUUID);
      const characteristic = writableCharacteristics[serviceUUID][0]; // Get the first writable characteristic

      const encoder = new TextEncoder("utf-8");
      const data = encoder.encode(command);
      await characteristic.writeValue(data);

      console.log(`Sent command: ${command}`);
      setToastMessage(`Command sent: ${command}`);
    } catch (error) {
      console.error("Error writing characteristic: ", error);
      setToastMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <Button onClick={connectToDevice}>Connect to Bluetooth Device</Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <h4>Characteristics</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Service UUID</th>
                <th>Description</th>
                <th>Commands</th>
              </tr>
            </thead>
            <tbody>
              {characteristicsList.map(({ characteristic, serviceUUID }, index) => (
                <tr key={index}>
                  <td>{serviceUUID}</td>
                  <td>{characteristics[serviceUUID]?.description}</td>
                  <td>
                    {writableCharacteristics[serviceUUID]?.map(({ uuid }) => (
                      <Button key={uuid} onClick={() => writeCharacteristic(serviceUUID, "Your Command Here")}>
                        Send Command
                      </Button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <ToastContainer position="top-end" className="p-3">
        <Toast>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default App;
