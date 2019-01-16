import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Mood from '@material-ui/icons/Mood';
import MoodBad from '@material-ui/icons/MoodBad';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router';
import EventIcon from '@material-ui/icons/Event';
import MoneyIcon from '@material-ui/icons/MonetizationOn';
import RefreshIcon from '@material-ui/icons/Refresh';
import PercentageDiff from 'percentage-difference';
import NumberFormat from 'react-number-format';
import Moment from 'react-moment';
import 'moment-timezone';

import axios from 'axios';

const styles = theme => ({
  paper: {
    maxWidth: 936,
    margin: 'auto',
    overflow: 'hidden',
    marginBottom: 20
  },
  searchBar: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  block: {
    display: 'block',
  },
  addUser: {
    marginRight: theme.spacing.unit,
  },
  contentWrapper: {
    margin: '40px 16px',
  },
});

class Content extends React.Component {

  state = {
    data: {},
    orders: []
  }
  componentDidMount() {
    this.makeRequest();
  }

  makeRequest() {
    axios.get(`https://api.bitcointrade.com.br/v2/public/${this.props.currency}/ticker`)
    .then((response) => {
      console.log(response);
      this.setState({data: response.data.data})
    })
    .catch(error => {
      console.log(error);
    });

    axios.get(`https://api.bitcointrade.com.br/v2/market/user_orders/list?status=executed_completely&start_date=2019-01-01&end_date=2019-05-05&pair=${this.props.currency}&type=buy&page_size=100&current_page=1`,
      {
        headers: {
          'Authorization': process.env.REACT_APP_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    )
    .then((response) => {
      console.log('orders', response.data.data.orders);
      this.setState({orders: response.data.data.orders})
    })
    .catch(error => {
      console.log(error);
    });
  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;
    const diff = (value) => data.buy && PercentageDiff(value, data.buy, true)
    return (
      <React.Fragment>
        {
          this.state.orders.length && this.state.orders.map((order, index) => {
             return (
              <Paper className={classes.paper} key={index}>
                <AppBar className={classes.searchBar} position="static" color="default" elevation={0}>
                  <Toolbar>
                    <Grid container spacing={16} alignItems="center">
                      <Grid item>
                        <EventIcon className={classes.block} color="inherit" />
                      </Grid>
                      <Grid item xs>
                        <Moment format="DD/MM/YYYY HH:MM">
                          {order.create_date}
                        </Moment>
                        <small>
                        {' '}
                        (<Moment fromNow>
                          {order.create_date}
                        </Moment>)
                        </small>
                      </Grid>
                      <Grid item>
                        <MoneyIcon className={classes.block} color="inherit" />
                      </Grid>
                      <Grid item xs>    
                        <NumberFormat value={order.total_price} displayType={'text'} thousandSeparator={true} prefix={'R$'} />
                      </Grid>
                      <Grid item>
                        <Button variant="contained" color="primary" className={classes.addUser}>
                          <span style={{marginRight: 5}}>Vender por </span> 
                           {diff(order.unit_price) > 0 ? (
                             <NumberFormat decimalScale={2} value={order.total_price * (1 + Math.abs(diff(order.unit_price)/100))} displayType={'text'} thousandSeparator={true} prefix={'R$'} />
                          ) : (
                             <NumberFormat decimalScale={2} value={order.total_price * (1 - Math.abs(diff(order.unit_price)/100))} displayType={'text'} thousandSeparator={true} prefix={'R$'} />
                          )
                          }
                        </Button>
                        <Tooltip title="Reload">
                          <IconButton>
                            <RefreshIcon className={classes.block} color="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Toolbar>
                </AppBar>
                <div className={classes.contentWrapper}>
                  <div style={{margin: '20px 0', textAlign: 'center'}}>
                    <Typography color="textSecondary" align="center" gutterBottom>
                      Valor da moeda Hoje:
                    </Typography>
                    <Chip label={<NumberFormat value={this.state.data.buy} displayType={'text'} thousandSeparator={true} prefix={'R$'} />} />
                  </div>
                  <div style={{margin: '20px 0', textAlign: 'center'}}>
                    <Typography color="textSecondary" align="center" gutterBottom>
                      Valor da moeda quando você comprou
                    </Typography>
                    <Chip label={<NumberFormat value={order.unit_price} displayType={'text'} thousandSeparator={true} prefix={'R$'} />} />
                  </div>
                  <Typography color="textSecondary" align="center">
                    Rendimento agora
                  </Typography>
                  {diff(order.unit_price) > 0 ? (
                    <Typography color="default" align="center">
                      <Mood />
                      <span>{diff(order.unit_price)}% </span>
                    </Typography> 
                  ) : (
                    <Typography color="error" align="center" variant="display1">
                      <span>{diff(order.unit_price)}% </span>
                      <MoodBad />
                    </Typography>
                  )
                  }
                </div>
              </Paper>
             ) 
          })
        }
      </React.Fragment>
    );
  }
}

Content.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Content));
