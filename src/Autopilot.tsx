import * as React from 'react'
import AutopilotAPI from './AutopilotAPI'
import './Autopilot.css'
import {SensorEvents} from '@chacal/js-utils'
import IAutopilotState = SensorEvents.IAutopilotState

interface AutopilotComponentState {
  autopilotState?: IAutopilotState
}

export default class Autopilot extends React.Component<{}, AutopilotComponentState> {
  pilotApi: AutopilotAPI

  constructor() {
    super()
    this.state = {}
    this.pilotApi = new AutopilotAPI('ws://mqtt-home.chacal.fi:8883', '10')
    this.pilotApi.autopilotStates.onValue(autopilotState => this.setState({autopilotState}))
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-12 text-center" id="course">{this.state.autopilotState ? Math.round(radsToDeg(this.state.autopilotState.course)) : ''}</div>
      </div>
    )
  }
}

function radsToDeg(rads: number): number { return rads * 180 / Math.PI }
