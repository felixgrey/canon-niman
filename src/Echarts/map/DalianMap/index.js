import * as echarts from 'echarts';
import React from 'react';
import { Select } from 'antd';
import DalianMapData from './DalianMapData';
import 'antd/dist/antd.css';
import './index.less';

const { Option } = Select;

export default class DalianMap extends React.Component {

  constructor(...args) {
    super(...args);
    this.selected = [];
    this.mapName = Date.now();

    this.districtsMap = {};
    this.districts = DalianMapData.features.map((item, i) => {
      const {
        name,
        adcode,
      } = (item.properties || {});

      return this.districtsMap[name] =
        this.districtsMap[adcode] = {
          name,
          adcode,
          value: adcode,
          label: name,
        };
    });
  }

  componentDidUpdate() {
    let {
      value = this.selected,
      disabledValue = [],
    } = this.props;

    value = [].concat(value);

    this.districts.forEach((item, i) => {
      const name = item.name;
      const selected = value.includes(name) && !disabledValue.includes(name);
      this.myChart.dispatchAction({
          type: selected ? 'select' : 'unselect',
          seriesIndex: 0,
          dataIndex: i,
      });
    });
  }

  isMuti() {
    return !!this.props.muti;
  }

  setSelectMode() {
    this.options.series[0].selectedMode = this.isMuti() ? 'multiple' : 'single';
  }

  componentDidMount() {
     const {
       mapName = this.mapName,
     } = this.props;

     echarts.registerMap(mapName, DalianMapData); // 自定义地图
     this.myChart = echarts.init(this.container);

     this.options = {
       geo: {
         type: 'map',
         map: mapName,
         aspectScale: '0.85',
         layoutCenter: ["50%", "50%"], //地图位置
         layoutSize: '100%',
         label: {
           normal: {
             show: true,
             textStyle: {
               color: '#fff',
               fontSize: 14,
               fontWeight: 'bold'
             }
           },
           emphasis: {
             textStyle: {
               color: '#fff'
             }
           }
         },
         itemStyle: {
           normal: {
             borderWidth: 0,
             areaColor: '#3a75f8'
           },
         },
         select: {
          itemStyle: {
            areaColor: '#1ff884',
            borderWidth: 2,
          }
         }
       },
       series: [{
         type: 'map',
         map: mapName,
         geoIndex: 0,
         data: []
       }]
     }

     this.setSelectMode();

     this.myChart.on('click', e => this.clickHandle(e.name) );
     this.myChart.setOption(this.options);

  }

  clickHandle = (name) => {
      const index = this.selected.indexOf(name);

      if (this.isMuti()) {
        if (index === -1) {
          this.selected.push(name);
        } else {
          this.selected.splice(index, 1);
        }
        if (this.props.onChange) {
         this.props.onChange([...this.selected]);
        }
      } else {
        this.selected = [name];
        if (this.props.onChange) {
         this.props.onChange(this.selected[0]);
        }
      }

      this.forceUpdate();
  }

  render() {
    const {
      style = {
        width: 400,
        height: 400,
      },
      className = ''
    } = this.props;

    const value = this.isMuti() ? this.selected : this.selected[0];

    return <div className={'echarts-map ' + className} style={style}>
        <Select style={{ width:400, margin: 20 }} value={value}
          placeholder="请选择区域"
          mode={this.isMuti() ? "multiple" : ""}
          onSelect={(v) => this.clickHandle(v)}
          onDeselect={(v) => this.clickHandle(v)} >
          {this.districts.map((item, index) => {
            return <Option key={index} value={item.name}>{item.name}</Option>
          })}
        </Select>
        <div className='map' style={{height: '100%'}}
            ref={container => this.container = container}> </div>
      </div>
  }
}
