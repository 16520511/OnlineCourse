import React, {Component} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'
import Paypal from './Paypal'

export default class Cart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cart: {
                courses: [],
                user: {}
            }
        }
    }

    async componentWillMount() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        await axios.post('/api/cart', {username: username}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            if (res.data.message !== 'unauthorized')
                this.setState({
                    cart: res.data
                });
        });
        
    }

    checkoutSuccessful = () => {
        this.setState({
            cart: {
                courses: [],
                user: {}
            }
        });
    }

    removeItem = (id, removeAll = false) => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        axios.post('/api/remove-cart-item', {username: username, courseId: id, removeAll}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            if (res.data.message !== 'unauthorized')
            {
                console.log(res.data);
                this.setState({
                    cart: {
                        courses: res.data
                    }
                });
            }
        });
    }

    render() {
        let totalPrice = 0;
        const itemsInCart = this.state.cart.courses.map(item => {
            totalPrice += item.price;
            return (
                <div className='cart-item'>
                    <a className="close-btn" onClick={() => {this.removeItem(item._id)}}>Remove</a>
                    <div className='cart-item-img'>
                        <img width='100%' src={'/' + item.image} alt={item.title} />
                    </div>
                    <div className='cart-item-info'>
                        <h5><Link to={item.slug}>{item.title}</Link></h5>
                        <p>Instructor: {item.instructor.firstName + ' ' + item.instructor.lastName}</p>
                    </div>
                </div>)
        });
        let totalItems = itemsInCart.length === 0 ? (<h5>You don't have any course in cart.</h5>) : 
        (itemsInCart.length === 1 ? (<h5>You have 1 course in cart</h5>) : (<h5>You have {itemsInCart.length} courses in cart</h5>));

        let paypalCheckout = itemsInCart.length === 0 ? '' : 
            (<div className='right checkout'>
                <h5>Total Price: ${totalPrice}</h5>
                <Paypal price={totalPrice} checkoutSuccessful={this.checkoutSuccessful}/>
            </div>)

        let removeAll = itemsInCart.length === 0 ? '' : <a className='remove-all-cart' onClick={() => {this.removeItem('', true)}}>Remove All</a>;
        return(
            <div>
                <div className='cart'>
                    <div className="">
                    <h4 className='teal-text'><i class="material-icons small left">shopping_cart</i>Shopping Cart</h4>
                    <div className='cart-items'>
                        {totalItems}
                        {removeAll}
                        {itemsInCart}
                    </div>
                    </div>
                    {paypalCheckout}
                </div>
            </div>
        )
    }
}