import React, { Component } from "react";

import axios from "axios";

import Draggable from "react-draggable";
import { sortableContainer, sortableElement } from "react-sortable-hoc";
import { Table, Column } from "react-virtualized";
import arrayMove from "array-move";

import { VscArrowBoth, VscRemote } from "react-icons/vsc";

import "react-virtualized/styles.css";

const ROW_HEIGHT = 30;
const HEADER_ROW_HEIGHT = 20;
const COL_WIDTH = 250;

const SortableHeader = sortableElement(({ children, ...props }) =>
  React.cloneElement(children, props)
);

const SortableHeaderRowRenderer = sortableContainer(
  ({ className, columns, style }) => (
    <div className={className} role="row" style={style}>
      {React.Children.map(columns, (column, index) => (
        <SortableHeader index={index}>{column}</SortableHeader>
      ))}
    </div>
  )
);

export default class UniTable extends Component {
  state = {
    loaded: false,
    visible: this.props.visible,
    allCols: this.props.cols,
    flatCols: (() => {
      let out = {};
      this.props.cols.forEach((col) => {
        out[col.dataKey] = col;
      });
      return out;
    })(),
    cols: this.props.cols.filter((col) =>
      this.props.visible.includes(col.dataKey)
    ),
    totalWidth: COL_WIDTH * this.props.visible.length,
    widths: (() => {
      const width = 1 / this.props.visible.length;
      let out = {};
      this.props.cols.forEach((col) => {
        out[col.dataKey] = width;
      });
      return out;
    })(),
    rows: [],
    limit: this.props.limit,
    offset: this.props.offset,
    where: this.props.where,
    order: this.props.order,
  };

  getData = async (callback) => {
    let { state } = this;
    let rows = (
      await axios.post(`${this.props.api}/data`, {
        limit: state.limit,
        offset: state.offset,
        where: state.where,
        order: state.order,
        attributes: state.visible,
      })
    ).data;
    this.setState({ rows }, callback);
    rows = null;
    state = null;
  };

  componentDidMount() {
    this.getData(() => {
      this.setState({ loaded: true });
    });
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      visible: arrayMove(this.state.visible, oldIndex, newIndex),
    });
  };

  renderHeaderRow = (params) => {
    return (
      <SortableHeaderRowRenderer
        {...params}
        visible={this.state.visible}
        axis="x"
        lockAxis="x"
        onSortEnd={this.onSortEnd}
      />
    );
  };

  cellRenderer = ({ columnData, columnIndex, rowIndex }) => {
    return <div>{this.state.rows[rowIndex][columnData.dataKey]}</div>;
  };

  headerRenderer = ({
    columnData,
    dataKey,
    disableSort,
    label,
    sortBy,
    sortDirection,
  }) => {
    if (this.state.visible[this.state.visible.length - 1] === dataKey) {
      return <span>{label}</span>;
    }
    return (
      <>
        <span>{label}</span>
        <Draggable
          axis="x"
          defaultClassName="DragHandle"
          defaultClassNameDragging="DragHandleActive"
          //   scale={}
          onDrag={(event, { deltaX }) =>
            this.resizeRow({
              dataKey,
              deltaX,
            })
          }
          position={{ x: 0 }}
          zIndex={999}
        >
          <span className="float-right cursor-move align-middle">
            <VscRemote />
          </span>
        </Draggable>
      </>
    );
  };

  resizeRow = ({ dataKey, deltaX }) =>
    this.setState((prevState) => {
      const prevWidths = prevState.widths;
      const percentDelta = deltaX / this.state.totalWidth;

      const nextDataKey =
        this.state.visible[this.state.visible.indexOf(dataKey) + 1] ||
        this.state.visible[0];

      return {
        widths: {
          ...prevWidths,
          [dataKey]: prevWidths[dataKey] + percentDelta,
          [nextDataKey]: prevWidths[nextDataKey] - percentDelta,
        },
      };
    });

  render() {
    if (!this.state.loaded) return "Loading <UniTable /> ... ";
    return (
      <Table
        width={COL_WIDTH * this.state.visible.length}
        height={HEADER_ROW_HEIGHT + ROW_HEIGHT * this.state.rows.length}
        headerHeight={ROW_HEIGHT}
        rowHeight={ROW_HEIGHT}
        rowCount={this.state.rows.length}
        rowGetter={({ index }) => this.state.rows[index]}
        headerRowRenderer={this.renderHeaderRow}
        noContentRenderer={() => "No records found ..."}
      >
        {this.state.visible.map((col, index) => (
          <Column
            label={col}
            columnData={this.state.flatCols[col]}
            dataKey={col}
            width={this.state.widths[col] * this.state.totalWidth}
            cellRenderer={this.cellRenderer}
            headerRenderer={this.headerRenderer}
          />
        ))}
      </Table>
    );
  }
}
