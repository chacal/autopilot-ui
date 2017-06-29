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
          {this.renderCourse()}
        </div>
        <div className="row">
          {this.renderMainButton('Standby', p => !p.enabled)}
          {this.renderMainButton('Auto', p => p.enabled)}
        </div>
        <div className="row" id="adjustments">
          {this.renderCourseButton('-10°')}
          {this.renderCourseButton('-1°')}
          {this.renderCourseButton('1°')}
          {this.renderCourseButton('10°')}
        </div>
      </div>
    )
  }

  renderCourse() {
    return (
      <div className="col-xs-12 text-center" id="course">{this.state.autopilotState ? Math.round(radsToDeg(this.state.autopilotState.course)) : ''}</div>
    )
  }

  renderMainButton(text: string, shouldDisable: (s: IAutopilotState) => boolean) {
    return (
      <div className="col-xs-5 col-xs-offset-1">
        <button disabled={this.state.autopilotState === undefined || shouldDisable(this.state.autopilotState)} className="btn btn-primary">{text}</button>
      </div>
    )
  }

  renderCourseButton(text: string) {
    return (
      <div className="col-xs-3">
        <button className="btn btn-default" disabled={this.state.autopilotState === undefined || !this.state.autopilotState.enabled}>{text}</button>
      </div>
    )
  }
}

function radsToDeg(rads: number): number { return rads * 180 / Math.PI }
