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
          {renderCourse(pilotState)}
        </div>
        <div className="row">
          {renderMainButton('Standby', pilotState, p => !p.enabled)}
          {renderMainButton('Auto', pilotState, p => p.enabled)}
        </div>
        <div className="row" id="adjustments">
          {renderCourseButton('-10°', pilotState)}
          {renderCourseButton('-1°', pilotState)}
          {renderCourseButton('1°', pilotState)}
          {renderCourseButton('10°', pilotState)}
        </div>
      </div>
    )
  }
}

function renderCourse(pilotState: IAutopilotState | undefined) {
  return (
    <div className="col-xs-12 text-center" id="course">{pilotState ? Math.round(radsToDeg(pilotState.course)) : ''}</div>
  )
}

function renderMainButton(text: string, pilotState: IAutopilotState | undefined, shouldDisable: (s: IAutopilotState) => boolean) {
  return (
    <div className="col-xs-5 col-xs-offset-1">
      <button disabled={pilotState === undefined || shouldDisable(pilotState)} className="btn btn-primary">{text}</button>
    </div>
  )
}

function renderCourseButton(text: string, pilotState: IAutopilotState | undefined) {
  return (
    <div className="col-xs-3">
      <button className="btn btn-default" disabled={pilotState === undefined || !pilotState.enabled}>{text}</button>
    </div>
  )
}

function radsToDeg(rads: number): number { return rads * 180 / Math.PI }
