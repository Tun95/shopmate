import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./styles.scss";
import dateFormat, { masks } from "dateformat";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Context } from "../../../Context/Context";
import { getError } from "../../Utilities/util/Utils";
import LoadingBox from "../../Utilities/message loading/LoadingBox";
import MessageBox from "../../Utilities/message loading/MessageBox";
import Footer from "../../../common/footer/Footer";
import { request } from "../../../base_url/Base_URL";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false, errorDeliver: action.payload };
    case "DELIVER_RESET":
      return { ...state, loadingDeliver: false, errorDeliver: false };
    default:
      return state;
  }
};

function OrderDetails({ currencySign, webname }) {
  const now = new Date();

  const navigate = useNavigate();
  const { state } = useContext(Context);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;

  const [{ loading, error, order, loadingDeliver, successDeliver }, dispatch] =
    useReducer(reducer, {
      loading: true,
      order: {},
      error: "",
    });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`${request}/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate("/signin");
    }
    // if (!order._id || successDeliver || (order._id && order._id !== orderId)) {
    if (successDeliver) {
      dispatch({ type: "DELIVER_RESET" });
    }
    fetchOrder();
  }, [navigate, orderId, successDeliver, userInfo]);

  //ORDER APPROVE
  async function deliverOrderHandler() {
    try {
      // dispatch({ type: "DELIVER_REQUEST" });
      const { data } = await axios.put(
        `${request}/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      toast.success("Order is delivered successfully", {
        position: "bottom-center",
      });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "DELIVER_FAIL" });
    }
  }

  //PAY FOR ORDER
  const payNowHandler = () => {
    navigate(`/payment/${orderId}`);
  };

  dateFormat(now, `mmmm d, yyyy`);
  console.log(order);
  return (
    <>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <div className="order-screen">
            <div className="o-screen">
              <Helmet>
                <title>Order {orderId}</title>
              </Helmet>
              <h1 className="order-header"> Order {orderId}</h1>
              <div className="list-box">
                <div className="order-sec">
                  <div className="order-details">
                    <div className="top-split">
                      <div className="top-box">
                        <h2>Shipping</h2>
                        <div className="order-a-ship">
                          <div className="order-top">
                            <label htmlFor="">
                              <strong>Name: </strong>
                            </label>
                            {order.shippingAddress.firstName}{" "}
                            {order.shippingAddress.lastName} <br />
                            <label htmlFor="">
                              <strong>Address: </strong>
                            </label>
                            {order.shippingAddress.address},{" "}
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.cState},{" "}
                            {order.shippingAddress.zipCode},{" "}
                            {order.shippingAddress.country} <br />
                            <label htmlFor="">
                              <strong>Shipping Method: </strong>
                            </label>
                            {order.shippingAddress.shipping}
                          </div>
                          <div className="place-deliver">
                            <div className="ind-deliver">
                              {order.isDelivered ? (
                                <div className="suc">
                                  <MessageBox variant="success">
                                    Delivered on {dateFormat(order.deliveredAt)}
                                  </MessageBox>
                                </div>
                              ) : (
                                <MessageBox variant="danger">
                                  Not Delivered
                                </MessageBox>
                              )}
                            </div>
                            {userInfo.isAdmin &&
                            order.isPaid &&
                            !order.isDelivered ? (
                              <div className="admin-approve">
                                <div className="admin-approve-btn">
                                  <button
                                    type="button"
                                    onClick={deliverOrderHandler}
                                  >
                                    Deliver Order
                                  </button>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                      <table className="order-table-data">
                        <thead>
                          <tr>
                            <td className="t-header" colSpan="2" align="center">
                              <h2> Order Summary</h2>
                            </td>
                          </tr>
                        </thead>
                        <tbody cellPadding="3">
                          <tr>
                            <td className="items-p">Items Price</td>
                            <td className="items-d">
                              {currencySign}
                              {order.itemsPrice.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="items-p">Shipping Price</td>
                            <td className="items-d">
                              {currencySign}
                              {order.shippingPrice.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="items-p">Tax Price</td>
                            <td className="items-d">
                              {currencySign}
                              {order.taxPrice.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong className="items-p grand">
                                Grand Total
                              </strong>
                            </td>
                            <td className="items-d grand">
                              <strong>
                                {currencySign}
                                {order.grandTotal.toFixed(2)}
                              </strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="sec-box">
                      <h2>Payment</h2>
                      <div className="sec-box-body">
                        <div className="p-method">
                          <strong>Payment Method: </strong>
                          <span className="payment_method">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <br />
                        <div className="p-method">
                          <strong>Status: </strong>
                        </div>
                        <div>
                          {userInfo._id && order.isPaid ? (
                            <MessageBox variant="success">
                              {order.paymentMethod === "Cash on Delivery" ? (
                                <span className="with_cash">
                                  Paid with Cash on Delivery
                                </span>
                              ) : (
                                <span>Paid on {dateFormat(order.paidAt)}</span>
                              )}
                            </MessageBox>
                          ) : userInfo._id ? (
                            <div className="not-paid-btn">
                              <MessageBox variant="danger">Not Paid</MessageBox>
                              <button
                                className="sec-pay-now"
                                onClick={payNowHandler}
                              >
                                Pay Now
                              </button>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="order-items">
                      <h2>Items</h2>
                      <div className="items-box">
                        <div className="items-box">
                          <TableContainer component={Paper} className="table">
                            <Table
                              sx={{ minWidth: 650 }}
                              aria-label="simple table"
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell className="tableCell">
                                    Item Detail
                                  </TableCell>
                                  <TableCell className="tableCell">
                                    Size
                                  </TableCell>
                                  <TableCell className="tableCell">
                                    Seller
                                  </TableCell>
                                  <TableCell className="tableCell">
                                    Quantity
                                  </TableCell>
                                  <TableCell className="tableCell">
                                    Price
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.orderItems?.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="tableCell">
                                      <span className="item_details">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="order_small"
                                        />
                                        <div className="order_name_gen">
                                          <Link to={`/product/${item.slug}`}>
                                            <h3>{item.name}</h3>
                                          </Link>
                                          <div className="gen">
                                            {item.keygen}
                                            <img
                                              src={item.color}
                                              alt=""
                                              className="color_image_size"
                                            />
                                          </div>
                                        </div>
                                      </span>
                                    </TableCell>
                                    <TableCell className="tableCell">
                                      {item.size}
                                    </TableCell>
                                    <TableCell className="tableCell">
                                      <span className="seller_name">
                                        {item.sellerName || webname}
                                      </span>
                                    </TableCell>
                                    <TableCell className="tableCell">
                                      <span className="quantity">
                                        {item.quantity}
                                      </span>
                                    </TableCell>
                                    <TableCell className="tableCell">
                                      <div className="order_cart_price">
                                        {item.discount ? (
                                          <div className="cart-price">
                                            {currencySign}
                                            {(
                                              item.price -
                                              (item.price * item.discount) / 100
                                            ).toFixed(0) * item.quantity}
                                          </div>
                                        ) : (
                                          <div className="cart-price">
                                            {currencySign}
                                            {item.price.toFixed(0) *
                                              item.quantity}
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer">
            <Footer />
          </div>
        </>
      )}
    </>
  );
}

export default OrderDetails;
