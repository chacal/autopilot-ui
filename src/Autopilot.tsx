import * as React from 'react'
import Bacon = require('baconjs')
import AutopilotAPI from './AutopilotAPI'
import './Autopilot.css'
import {SensorEvents} from '@chacal/js-utils'
import IAutopilotState = SensorEvents.IAutopilotState
import Property = Bacon.Property

interface AutopilotComponentState {
  autopilotState?: IAutopilotState
  variation?: number
}

export default class Autopilot extends React.Component<{}, AutopilotComponentState> {
  pilotApi: AutopilotAPI

  constructor() {
    super()
    this.state = {}
    this.pilotApi = new AutopilotAPI('ws://mqtt-home.chacal.fi:8883', '10')
    Bacon.combineAsArray(this.pilotApi.autopilotStates, magneticVariationFromSignalK())
      .onValues((autopilotState, variation) => this.setState({autopilotState, variation}))
  }

  render() {
    return (
      <div className="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
        <div className="row">
          {this.renderCourse()}
        </div>
        <div className="row">
          {this.renderMainButton(2, 'Standby', p => !p.enabled)}
          {this.renderMainButton(1, 'Auto', p => p.enabled)}
        </div>
        <div className="row" id="adjustments">
          {this.renderCourseButton(6, '-10°')}
          {this.renderCourseButton(5, '-1°')}
          {this.renderCourseButton(4, '1°')}
          {this.renderCourseButton(3, '10°')}
        </div>
      </div>
    )
  }

  renderCourse() {
    const course = this.state.autopilotState ? Math.round(radsToDeg(this.state.autopilotState.course + (this.state.variation || 0))) : '-'
    const units = this.state.autopilotState ? (this.state.variation ? '°T' : '°M') : ''
    return (
      <div className="col-xs-12 text-center" id="course">{course}<span className="units">{units}</span></div>
    )
  }

  renderMainButton(buttonId: number, text: string, shouldDisable: (s: IAutopilotState) => boolean) {
    return (
      <div className="col-xs-5 col-xs-offset-1">
        <button
          onClick={e => this.pilotApi.sendButtonPress(buttonId)}
          disabled={this.state.autopilotState === undefined || shouldDisable(this.state.autopilotState)}
          className="btn btn-primary">
            {text}
        </button>
      </div>
    )
  }

  renderCourseButton(buttonId: number, text: string) {
    return (
      <div className="col-xs-3">
        <button
          onClick={e => this.pilotApi.sendButtonPress(buttonId)}
          disabled={this.state.autopilotState === undefined || !this.state.autopilotState.enabled}
          className="btn btn-default">
            {text}
        </button>
      </div>
    )
  }
}

function magneticVariationFromSignalK(): Property<{}, number> {
  return Bacon.fromPromise(
    fetch('http://freya-raspi.chacal.fi/signalk/v1/api/vessels/self/navigation/magneticVariation/value')
      .then(r => r.json())
  ).toProperty(undefined)
}

function radsToDeg(rads: number): number { return rads * 180 / Math.PI }
