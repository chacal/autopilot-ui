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
    return this.renderUI(this.state.autopilotState)
  }

  renderUI(pilotState: IAutopilotState | undefined) {
    return (
      <div className="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3">
        <div className="row">
          <div className="col-xs-12 text-center" id="course">{pilotState ? Math.round(radsToDeg(pilotState.course)) : ''}</div>
        </div>
        <div className="row">
          <div className="col-xs-5 col-xs-offset-1">
            <button disabled={pilotState === undefined || !pilotState.enabled} className="btn btn-primary">Standby</button>
          </div>
          <div className="col-xs-5">
            <button disabled={pilotState === undefined || pilotState.enabled} className="btn btn-primary">Auto</button>
          </div>
        </div>
      </div>
    )
  }
}

function radsToDeg(rads: number): number { return rads * 180 / Math.PI }
