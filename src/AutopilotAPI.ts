import mqtt = require('mqtt')
import Client = mqtt.Client
import Bacon = require('baconjs')
import EventStream = Bacon.EventStream
import {SensorEvents} from '@chacal/js-utils'
import IAutopilotState = SensorEvents.IAutopilotState
import IAutopilotCommand = SensorEvents.IAutopilotCommand

// Declare fromEvent() version thas is used with MQTT message handler
declare module 'baconjs' {
  function fromEvent<E, A>(target: EventTarget|NodeJS.EventEmitter|JQuery, eventName: string, eventTransformer: (t: string, m: string) => A): EventStream<E, A>
}

export default class AutopilotAPI {
  readonly instance: string
  readonly client: Client
  autopilotStates: EventStream<{}, IAutopilotState>

  constructor(brokerUrl: string, instance: string) {
    this.instance = instance
    this.client = mqtt.connect(brokerUrl)
    this.autopilotStates = waitForConnect(this.client)
      .flatMapLatest(client => autopilotStatesFromBroker(client, instance))
  }

  sendButtonPress(buttonId: number) {
    const cmd: IAutopilotCommand = {buttonId, isLongPress: false, instance: this.instance, tag: 'a', ts: new Date().toISOString()}
    this.client.publish(`/command/${this.instance}/a/state`, JSON.stringify(cmd))
  }
}

function waitForConnect<A>(client: Client): EventStream<A, Client> {
  client.queueQoSZero = false
  client.on('connect', () => console.log('Connected to MQTT server'))
  client.on('offline', () => console.log('Disconnected from MQTT server'))
  client.on('error', (e) => console.log('MQTT client error', e))

  return Bacon.fromEvent(client, 'connect').first()
    .map(() => client)
}

function autopilotStatesFromBroker(client: Client, instance: string) {
  client.subscribe(`/local/sensor/${instance}/b/state`)
  return Bacon.fromEvent(client, 'message', autopilotStateFromMqttMessage)
}

function autopilotStateFromMqttMessage(topic: string, message: string): IAutopilotState {
  return JSON.parse(message) as IAutopilotState
}
