import * as React from 'react'
import mqtt = require('mqtt')
import Client = mqtt.Client

import './Autopilot.css'

class Autopilot extends React.Component<{}, {}> {
  mqttClient: Client

  constructor() {
    super()
    this.mqttClient = this.startMqttClient('ws://mqtt-home.chacal.fi:8883')
  }

  render() {
    return (
      <div>Render UI here</div>
    )
  }

  startMqttClient(brokerUrl: string) {
    const mqttClient = mqtt.connect(brokerUrl)
    mqttClient.on('connect', () => {
      mqttClient.subscribe('/sensor/+/+/state')
      mqttClient.on('message', this.onMqttMessage.bind(this))
    })
    return mqttClient
  }

  onMqttMessage(topic: string, message: Buffer) {
    const [, , instance, tag, ] = topic.split('/')
    console.log('Got message:', instance, tag)
  }
}

export default Autopilot
