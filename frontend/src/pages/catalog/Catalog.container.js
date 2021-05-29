import React from "react";
import { Flowable } from "rsocket-flowable";

import { Client } from "../../Client";
import { MessageCatalog } from "../../MessageCatalog";
import { Message } from "../../Message";

import Catalog from './Catalog';
import { MessagePrice } from "../../MessagePrice";

class CatalogPage extends React.Component {
  requestCatalogSubscription;
  requestPriceClientSubscription;
  requestPriceServerSubscription;

  state = {
    connected: false,
    catalogInProgress: false,
    priceInProgress: false,
    handleOnConnect: false,
    address: 'ws://localhost:7000',
    log: '',
    isLoading: true,
    chunkId: 0,
    items: [],
  }

  componentDidMount() {
    this.handleConnect();
    this.fetchMoreData();
  }

  componentWillUnmount() {
    if (this.state.connected) {
      this.requestCatalogSubscription.cancel();
      this.setState({ catalogInProgress: false });
    }
  }

  handleConnect() {
    if (!this.state.connected) {
      this.client = new Client(this.state.address);
      this.client.connect().then(sub => {
        this.setState({ connected: true });

        if (this.state.handleOnConnect) {
          this.handleRequestCatalog();
        }
      });
    } else {
      this.client.disconnect();
      this.setState({ connected: false });
    }
  }

  handleRequestCatalog() {
    if(!this.state.catalogInProgress) {
      let requestedMsg = 10;
      let processedMsg = 0;
      let items = [];
      
      let msg = new MessageCatalog(this.state.chunkId);

      this.client.requestCatalog(msg).subscribe({
        onSubscribe: sub => {
          this.requestCatalogSubscription = sub;
          this.requestCatalogSubscription.request(requestedMsg);
          this.setState({ catalogInProgress: true });
        },
        onError: error => {
            
        },
        onNext: msg => {
          items.push(msg.data);
          processedMsg++;

          if (processedMsg >= requestedMsg) {
            this.setState({
              items: this.state.items.concat(items),
              isLoading: false,
              chunkId: this.state.chunkId + 1
            });

            this.requestCatalogSubscription.cancel();
            this.setState({ catalogInProgress: false });

            this.handleRequestPrice(items);
          }
        },
        onComplete: msg => {
          console.log('ON COMPLETE:', msg);
        },
      });
    } else {
      this.requestCatalogSubscription.cancel();
      this.setState({ catalogInProgress: false });
    }
  }

  handleRequestPrice(itemsForPrice) {
    if(!this.state.priceInProgress) {
        let index = 0;
        let requestedMsg = 10;
        let processedMsg = 0;
        let cancelled = false;

        let flow = new Flowable(subscriber => {
            this.requestPriceClientSubscription = subscriber;
            this.requestPriceClientSubscription.onSubscribe({
                cancel: () => {
                    cancelled = true;
                },
                request: n => {
                    console.log('REQUEST CHANNEL: OUTBOUND: ' + n + ' message(s) was/were requested by the server');

                    let intervalID = setInterval(() => {
                        if (n > 0 && !cancelled) {

                            if (index >= requestedMsg) {

                            } else {
                              console.log('send message from client', index);
                              console.log(itemsForPrice[index]);

                              const msg = new MessagePrice(itemsForPrice[index].id);
                              console.log('itemsForPrice[index].id',itemsForPrice[index].id);
                              index++;
                              
                              subscriber.onNext(msg);
  
                              console.log('REQUEST CHANNEL: OUTBOUND: new message sent: ' + msg.toString());
                            }
                            
                            n--;
                        } else {
                            window.clearInterval(intervalID);
                        }
                    }, 1000);
                }
            });
        });

        this.client.requestPrice(flow).subscribe({
            onSubscribe: sub => {
                console.log('subscribed to price');
                this.requestPriceServerSubscription = sub;
                this.requestPriceServerSubscription.request(requestedMsg);
                console.log('inbound onSubcribe: ' + requestedMsg + ' message(s) was/were requested by the client');
                this.setState({ priceInProgress: true });
            },
            onError: error => {
                console.log('REQUEST CHANNEL: INBOUND: error occurred:' + JSON.stringify(error));
            },
            onNext: msg => {
                console.log('msg', msg);
                console.log('REQUEST CHANNEL: INBOUND: new message arrived: ' + new Message().toObject(msg.data).toString());
                processedMsg++;

                if (processedMsg >= requestedMsg) {
                  // this.requestPriceServerSubscription.request(requestedMsg);
                  // console.log('REQUEST CHANNEL: INBOUND: ' + requestedMsg + ' message(s) was/were requested by the client');
                  // processedMsg = 0;
                  this.requestPriceClientSubscription._subscription.cancel();
                  this.requestPriceServerSubscription.cancel();
                  this.setState({ priceInProgress: false });
                }
            },
            onComplete: msg => {
                console.log('REQUEST CHANNEL: INBOUND: stream completed')
            },
        });
    } else {
        this.requestPriceClientSubscription._subscription.cancel();
        this.requestPriceServerSubscription.cancel();
        this.setState({priceInProgress: false});
        console.log('REQUEST CHANNEL: channel cancelled');
    }
  }

  fetchMoreData = () => {
    if (this.state.connected) {
      this.handleRequestCatalog();
    } else {
      this.setState({ handleOnConnect: true });
    }
  };

  render() {
    return (
      <Catalog
        isLoading={this.state.isLoading}
        items={this.state.items}
        fetchMoreData={this.fetchMoreData}
      />
    );
  }
}

export default CatalogPage;