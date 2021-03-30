import React from 'react';

const convertToSeconds = (h, m, s) => {
  return h * 3600 + m * 60 + s
}

const convertToTime = (s) => {
  if (s > 0) {
    const h = Math.trunc(s / 3600)
    const m = Math.trunc((s - h * 3600) / 60)
    const sec = s - h * 3600 - m * 60

    return {
      hours: h,
      minutes: m,
      seconds: sec
    }
  }
}

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: {
        seconds: 0,
        minutes: 0,
        hours: 0
      }
    };
  }


  tick() {
    this.setState(state => ({
      time: this.deltaTime()
    }));
  }

  deltaTime() {
    const currentTime = new Date();

    return convertToTime(
      convertToSeconds(this.props.time.hours, this.props.time.minutes, this.props.time.seconds) -
      convertToSeconds(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds())
    )
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


  render() {
    if (this.state.time != null) {
      return (
        <div>
          <label>Time left</label>
          {this.state.time.hours} hrs {this.state.time.minutes} min {this.state.time.seconds} sec
        </div>
      );
    }
    return (
      <div>
        <em>Your visit will begin shortly</em>
      </div>
    );
  }
}
export default Timer;