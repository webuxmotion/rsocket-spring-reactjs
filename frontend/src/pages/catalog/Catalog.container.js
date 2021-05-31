import React from "react";
import { Flowable } from "rsocket-flowable";
import { connect } from 'react-redux';

import { Client } from "../../Client";
import { MessageCatalog } from "../../MessageCatalog";
import { MessagePrice } from "../../MessagePrice";
import { MessageImage } from "../../MessageImage";

import { addPrices, addImages } from '../../redux/productSlice';

import Catalog from './Catalog';

class CatalogPage extends React.Component {
  requestCatalogSubscription;
  requestPriceClientSubscription;
  requestPriceServerSubscription;
  requestImageClientSubscription;
  requestImageServerSubscription;

  state = {
    connected: false,
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
      let requestedMsg = 100;
      let processedMsg = 0;
      let items = [];
      
      let msg = new MessageCatalog(this.state.chunkId);

      this.client.requestCatalog(msg).subscribe({
        onSubscribe: sub => {
          this.requestCatalogSubscription = sub;
          this.requestCatalogSubscription.request(requestedMsg);
        },
        onError: error => {},
        onNext: msg => {
          items.push(msg.data);
        
          processedMsg++;

          if (processedMsg >= requestedMsg) {

            this.setState({
              items: this.state.items.concat(items),
              isLoading: false,
              chunkId: this.state.chunkId + 1
            });

            this.handleRequestPrice(items);

            setTimeout(() => {
              this.handleRequestImage(items);
            }, 10000);
          }
        },
        onComplete: msg => {
          console.log('ON COMPLETE:', msg);
        },
      });
  }

  handleRequestPrice(itemsForPrice) {
    let index = 0;
    let requestedMsg = itemsForPrice.length;
    let processedMsg = 0;
    let cancelled = false;
    const prices = [];

    let flow = new Flowable(subscriber => {
      this.requestPriceClientSubscription = subscriber;
      this.requestPriceClientSubscription.onSubscribe({
        cancel: () => {
            cancelled = true;
        },
        request: n => {
          let intervalID = setInterval(() => {
            if (n > 0 && !cancelled) {

                if (index >= requestedMsg) {

                } else {
                  const msg = new MessagePrice(itemsForPrice[index].id);
                  index++;
                  subscriber.onNext(msg);
                }
                
                n--;
            } else {
                window.clearInterval(intervalID);
            }
          }, 10);
        }
      });
    });

    this.client.requestPrice(flow).subscribe({
        onSubscribe: sub => {
            this.requestPriceServerSubscription = sub;
            this.requestPriceServerSubscription.request(requestedMsg);
        },
        onError: error => {
            console.log('error', error);
        },
        onNext: msg => {
          
          prices.push(msg.data);
            processedMsg++;

            if (processedMsg >= requestedMsg) {
              this.props.addPrices(prices);
            }
        },
        onComplete: msg => {
            console.log('REQUEST CHANNEL: INBOUND: stream completed')
        },
    });
  }

  handleRequestImage(itemsForImage) {
    let index = 0;
    let requestedMsg = itemsForImage.length;
    let processedMsg = 0;
    let cancelled = false;
    const images = [];

    let flow = new Flowable(subscriber => {
      this.requestImageClientSubscription = subscriber;
      this.requestImageClientSubscription.onSubscribe({
        cancel: () => {
            cancelled = true;
        },
        request: n => {
          let intervalID = setInterval(() => {
            if (n > 0 && !cancelled) {

                if (index >= requestedMsg) {

                } else {
                  const msg = new MessageImage(itemsForImage[index].id);
                  index++;
                  subscriber.onNext(msg);
                }
                
                n--;
            } else {
                window.clearInterval(intervalID);
            }
          }, 10);
        }
      });
    });

    this.client.requestImage(flow).subscribe({
        onSubscribe: sub => {
            this.requestImageServerSubscription = sub;
            this.requestImageServerSubscription.request(requestedMsg);
        },
        onError: error => {
            console.log('error', error);
        },
        onNext: msg => {
          
          images.push(msg.data);
            processedMsg++;

            if (processedMsg >= requestedMsg) {
              this.props.addImages(images);
            }
        },
        onComplete: msg => {
            console.log('Image completed')
        },
    });
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
        prices={this.props.product.prices}
        images={this.props.product.images}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  product: state.product,
});

const mapDispatchToProps = (dispatch) => {
  return {
    addPrices: (items) => dispatch(addPrices(items)),
    addImages: (items) => dispatch(addImages(items))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CatalogPage);

