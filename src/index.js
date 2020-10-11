import React from "react";
import { render } from "react-dom";

import axios from "axios";

import UniTable from "./unitable";

import './tailwind.css';

const API_URL = `https://3000-ed28f304-ad4d-4003-a8aa-6cb1f383025e.ws-eu01.gitpod.io`;

class App extends React.Component {
  state = { loading: true, cols: [] };

  async componentDidMount() {
    const cols = (await axios.get(`${API_URL}/cols`)).data;
    this.setState({ cols, loading: false });
  }

  render() {
    if (this.state.loading) return "Loading ...";
    return (
      <UniTable
        api={API_URL}
        cols={this.state.cols}
        visible={["first_name", "last_name", "id"]}
        order={[["first_name", "DESC"]]}
        limit={1000}
        offset={0}
        where={{}}
      />
    );
  }
}

render(<App />, document.getElementById("root"));
