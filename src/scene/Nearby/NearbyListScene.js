/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, StatusBar } from 'react-native'
import { color, Button, NavigationItem, RefreshListView, RefreshState } from '../../widget'
import { Heading1, Heading2, Paragraph } from '../../widget/Text'
import { screen, system, tool } from '../../common'
import api from '../../api'

import NearbyCell from './NearbyCell'
import NearbyHeaderView from './NearbyHeaderView'


// create a component
class NearbyListScene extends PureComponent {

    listView: ListView

    state: {
        dataSource: ListView.DataSource,
        typeIndex: number
    }

    constructor(props: Object) {
        super(props)

        let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })

        this.state = {
            dataSource: ds.cloneWithRows([]),
            typeIndex: 0,
            netdata:[]
        }
    }

    componentDidMount() {

        this.listView.startHeaderRefreshing();

    }

    async requestData() {
        try {
            let response = await fetch(api.recommend)
            let json = await response.json()

            //console.log(JSON.stringify(json));
            //console.log(json.tracks);
            let dataList = json.data.map((info) => {
                return {
                    id: info.id,
                    imageUrl: info.squareimgurl,
                    title: info.mname,
                    subtitle: `[${info.range}]${info.title}`,
                    price: info.price
                }
            })



            // 偷懒，用同一个测试接口获取数据，然后打乱数组，造成数据来自不同接口的假象 >.<
            dataList.sort(() => { return 0.5 - Math.random() })
            let temp=this.state.netdata;

            temp=temp.concat(dataList);
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(temp),
                netdata:temp
            })
            setTimeout(() => {
                this.listView.endRefreshing(RefreshState.NoMoreData) //这里是没有数据了则这则为NoMoreData 依然有数据则为Idle根据服务器返回的数据动态判断  RefreshListView那个组件没有任何问题1
            }, 500);
        } catch (error) {
            this.listView.endRefreshing(RefreshState.Failure)
        }
    }

    render() {
        return (
            <RefreshListView
                ref={(e) => this.listView = e}
                dataSource={this.state.dataSource}
                renderHeader={() =>
                    <NearbyHeaderView
                        titles={this.props.types}
                        selectedIndex={this.state.typeIndex}
                        onSelected={(index) => {
                            if (index != this.state.typeIndex) {
                                this.setState({ typeIndex: index })
                                this.listView.startHeaderRefreshing()
                            }
                        }}
                    />
                }
                renderRow={(rowData) =>
                    <NearbyCell
                        info={rowData}
                        onPress={() => {
                            this.props.navigation.navigate('GroupPurchase', { info: rowData })
                        }}
                    />
                }
                onHeaderRefresh={() => {

                    this.requestData()
                }}
                onFooterRefresh={()=>{
                    this.requestData()
                }}
            />
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

//make this component available to the app
export default NearbyListScene;
