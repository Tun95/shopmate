import React, { useContext, useReducer, useRef, useState } from "react";
import "./product.css";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import Charts from "../../component/chart/Charts";
import JoditEditor from "jodit-react";
import data from "../../../data/data.json";

import { Context } from "../../../Context/Context";
import { useEffect } from "react";
import { getError } from "../../../components/Utilities/util/Utils";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../../../components/Utilities/message loading/LoadingBox";
import MessageBox from "../../../components/Utilities/message loading/MessageBox";
import { toast } from "react-toastify";

import PublishIcon from "@mui/icons-material/Publish";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import DeleteIcon from "@mui/icons-material/Delete";
import Footer from "../../../common/footer/Footer";
import { request } from "../../../base_url/Base_URL";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, product: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "FETCH_CATEGORY_REQUEST":
      return { ...state, loading: true };
    case "FETCH_CATEGORY_SUCCESS":
      return { ...state, loading: false, categories: action.payload };
    case "FETCH_CATEGORY_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "FETCH_BRAND_REQUEST":
      return { ...state, loading: true };
    case "FETCH_BRAND_SUCCESS":
      return { ...state, loading: false, brands: action.payload };
    case "FETCH_BRAND_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "FETCH_SIZE_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SIZE_SUCCESS":
      return { ...state, loading: false, sizes: action.payload };
    case "FETCH_SIZE_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };

    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return { ...state, loadingUpload: false, errorUpload: "" };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    case "FETCH_STATS_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_STATS_SUCCESS":
      return { ...state, loading: false, summary: action.payload, error: "" };
    case "FETCH_STATS_FAIL":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

function ProductEdit() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: productId } = params;

  const editor = useRef(null);

  const { genderselect } = data;
  const { state } = useContext(Context);
  const { userInfo, colors } = state;

  const [
    {
      loading,
      error,
      product,
      loadingUpload,
      brands,
      sizes,
      categories,
      errorUpload,
      summary,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: "",
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [keygen, setKeygen] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [desc, setDesc] = useState("");
  const [gender, setGender] = useState([]);
  const [category, setCategory] = useState([]);
  const [color, setColor] = useState([]);
  const [size, setSize] = useState([]);
  const [brand, setBrand] = useState([]);
  const [image, setImage] = useState("");
  const [images, setImages] = useState([]);

  //PRODUCT STATUS FETCHING
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(
          `${request}/api/products/${productId}`
        );
        setName(data.name);
        setSlug(data.slug);
        setKeygen(data.keygen);
        setCountInStock(data.countInStock);
        setPrice(data.price);
        setDiscount(data.discount);
        setDesc(data.desc);
        setGender(data.gender);
        setCategory(data.category);
        setColor(data.color);
        setSize(data.size);
        setBrand(data.brand);
        setImage(data.image);
        setImages(data.images);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [productId]);

  //PRODUCT UPDATE
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(
        `${request}/api/products/${productId}`,
        {
          _id: productId,
          name,
          slug,
          keygen,
          countInStock,
          price,
          discount,
          desc,
          gender,
          category,
          color,
          size,
          brand,
          image,
          images,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      toast.success("Product updated successfully", {
        position: "bottom-center",
      });
      navigate("/admin/products");
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPDATE_FAIL" });
    }
  };

  //IMAGE UPLOAD
  const uploadFileHandler = async (e, forImages) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);
    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post(`${request}/api/upload`, bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });
      if (forImages) {
        setImages([...images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success("Image uploaded successfully. Click update to apply it", {
        position: "bottom-center",
      });
    } catch (err) {
      toast.error(getError(err), { position: "bottom-center" });
      dispatch({ type: "UPLOAD_FAIL" });
    }
  };

  //PRODUCT STATS
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_STATS_REQUEST" });
        const { data } = await axios.get(`${request}/api/orders/summary`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_STATS_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_STATS_FAIL", payload: getError(err) });
        console.log(err);
      }
    };
    fetchData();
  }, [productId, userInfo]);

  const [salesStats, setSalesStats] = useState([]);

  useEffect(() => {
    const getStats = async () => {
      summary.salePerformance
        ?.reverse()
        ?.map((item) =>
          setSalesStats((prev) => [
            ...prev,
            { name: item._id, Sales: item.sales },
          ])
        );
    };
    getStats();
  }, [summary.salePerformance]);

  console.log(summary);
  console.log(salesStats);

  //DELETE IMAGES
  const deleteFileHandler = async (fileName) => {
    setImages(images.filter((x) => x !== fileName));
    toast.success("Image removed successfully. Click update to apply it", {
      position: "bottom-center",
    });
  };

  //FETCH ALL CATEGORY
  useEffect(() => {
    const fetchData = async () => {
      //dispatch({ type: "FETCH_CATEGORY_REQUEST" });
      try {
        const { data } = await axios.get(`${request}/api/category`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_CATEGORY_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_CATEGORY_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);

  //FETCH ALL BRANDS
  useEffect(() => {
    const fetchData = async () => {
      //dispatch({ type: "FETCH_BRAND_REQUEST" });
      try {
        const { data } = await axios.get(`${request}/api/brand`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_BRAND_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_BRAND_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);

  //FETCH ALL SIZE
  useEffect(() => {
    const fetchData = async () => {
      //dispatch({ type: "FETCH_SIZE_REQUEST" });
      try {
        const { data } = await axios.get(`${request}/api/size`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SIZE_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_SIZE_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 210,
      },
    },
  };
  return (
    <>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <div className="product-edit-page">
            <Helmet>
              <title>Product Edit ${productId}</title>
            </Helmet>

            <div className="product-edit">
              <div className="product">
                <div className="productTitleContainer">
                  <h1 className="productTitle">Product Edit </h1>
                </div>
                <div className="productTop">
                  <div className="productTopLeft">
                    <Charts
                      data={salesStats}
                      dataKey="Sales"
                      title="Sales Performance"
                    />
                  </div>
                  <div className="productTopRight">
                    <div className="productInfoTop">
                      <img
                        src={product?.image}
                        alt=""
                        className="productInfoImg"
                      />
                      <span className="productName">{product?.name}</span>
                    </div>
                    <div className="productInfoBottom">
                      <div className="productInfoItem">
                        <span className="productInfoKey">id: </span>
                        <span className="productInfoValue">
                          {" "}
                          &nbsp;{product?._id}
                        </span>
                      </div>
                      <div className="productInfoItem">
                        <span className="productInfoKey">sales:</span>
                        <span className="productInfoValue">
                          {product?.numSales}
                        </span>
                      </div>

                      <div className="productInfoItem">
                        <span className="productInfoKey">in stock:</span>
                        <span className="productInfoValue">
                          {product?.countInStock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="productBottom">
                  <form action="" onSubmit={submitHandler}>
                    <div className="productForm">
                      <div className="productFormLeft-styles">
                        <div className="productFormLeft productFormLeft-one">
                          <label htmlFor="name">Name</label>
                          <input
                            type="text"
                            id="name"
                            value={name}
                            maxLength="23"
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Novelty TShirt"
                          />
                          <label htmlFor="slug">Slug</label>
                          <input
                            type="text"
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="Novelty-TShirt"
                          />
                          <label htmlFor="keygen">Keygen</label>
                          <input
                            type="text"
                            id="keygen"
                            value={keygen}
                            onChange={(e) => setKeygen(e.target.value)}
                            placeholder="Men BK3569"
                          />
                          <label htmlFor="qty">Quantity</label>
                          <input
                            type="text"
                            id="qty"
                            value={countInStock}
                            onChange={(e) => setCountInStock(e.target.value)}
                            placeholder="123"
                          />
                        </div>
                        <div className="productFormLeft productFormLeft-Two">
                          <label htmlFor="gender">Gender</label>
                          <FormControl
                            variant="filled"
                            size="small"
                            id="formControl"
                          >
                            <Select
                              labelId="mui-simple-select-label"
                              id="mui-simple-select"
                              value={gender}
                              label={gender}
                              SelectDisplayProps={{
                                style: { paddingTop: 8, paddingBottom: 8 },
                              }}
                              MenuProps={MenuProps}
                              onChange={(e) => setGender(e.target.value)}
                            >
                              {genderselect.map((g, index) => (
                                <MenuItem key={index} value={g.gender}>
                                  {g.gender}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <label htmlFor="category" className="ccatb-des">
                            Category
                          </label>
                          <FormControl
                            variant="filled"
                            size="small"
                            id="formControl"
                          >
                            {/* <InputLabel id="mui-simple-select-label">
                        Category
                      </InputLabel> */}
                            <Select
                              labelId="mui-simple-select-label"
                              id="mui-simple-select"
                              multiple
                              MenuProps={MenuProps}
                              SelectDisplayProps={{
                                style: { paddingTop: 8, paddingBottom: 8 },
                              }}
                              value={category}
                              label={category}
                              onChange={(e) => setCategory(e.target.value)}
                            >
                              {categories?.map((c, index) => (
                                <MenuItem key={index} value={c.category}>
                                  {c.category}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <label htmlFor="color" className="ccatb-des">
                            Color
                          </label>
                          <FormControl
                            variant="filled"
                            size="small"
                            id="formControl"
                          >
                            {/* <InputLabel id="mui-simple-select-label">
                        Color
                      </InputLabel> */}
                            <Select
                              labelId="mui-simple-select-label"
                              id="mui-simple-select"
                              multiple
                              MenuProps={MenuProps}
                              SelectDisplayProps={{
                                style: { paddingTop: 8, paddingBottom: 8 },
                              }}
                              value={color}
                              label={color}
                              onChange={(e) => setColor(e.target.value)}
                            >
                              {colors?.map((c, index) => (
                                <MenuItem key={index} value={c.color}>
                                  <img
                                    src={c.color}
                                    alt={c.color}
                                    className="color_image_size"
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <label htmlFor="img" className="ccatb-des">
                            Image
                          </label>
                          <input
                            type="text"
                            id="img"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="/imgs/kid1.png"
                          />
                        </div>
                        <div className="productFormLeft productFormLeft-three">
                          <label htmlFor="size">Size</label>
                          <FormControl
                            variant="filled"
                            size="small"
                            id="formControl"
                          >
                            {/* <InputLabel id="mui-simple-select-label">Size</InputLabel> */}
                            <Select
                              labelId="mui-simple-select-label"
                              id="mui-simple-select"
                              multiple
                              MenuProps={MenuProps}
                              SelectDisplayProps={{
                                style: { paddingTop: 8, paddingBottom: 8 },
                              }}
                              value={size}
                              label={size}
                              onChange={(e) => setSize(e.target.value)}
                            >
                              {sizes?.map((s, index) => (
                                <MenuItem key={index} value={s.size}>
                                  {s.size}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <label htmlFor="brand" className="ccatb-des">
                            Brand
                          </label>
                          <FormControl
                            variant="filled"
                            size="small"
                            id="formControl"
                          >
                            <Select
                              labelId="mui-simple-select-label"
                              id="mui-simple-select"
                              multiple
                              MenuProps={MenuProps}
                              SelectDisplayProps={{
                                style: { paddingTop: 8, paddingBottom: 8 },
                              }}
                              value={brand}
                              label={brand}
                              onChange={(e) => setBrand(e.target.value)}
                            >
                              {brands?.map((b, index) => (
                                <MenuItem key={index} value={b.brand}>
                                  {b.brand}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <label htmlFor="price">Price</label>
                          <input
                            type="text"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="23"
                          />
                          <label htmlFor="discount">Discount</label>
                          <input
                            type="text"
                            id="discount"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="10"
                          />
                        </div>
                      </div>
                      <div className="productFormRight">
                        <div className="productUpload">
                          <img
                            src={image}
                            alt=""
                            className="productUploadImg"
                          />
                          {image === loadingUpload && <LoadingBox></LoadingBox>}
                          <label htmlFor="file">
                            <PublishIcon
                              className="upload-btn"
                              onChange={uploadFileHandler}
                            />
                          </label>
                          <input
                            onChange={uploadFileHandler}
                            type="file"
                            id="file"
                            style={{ display: "none" }}
                          />
                        </div>
                        <div className="productUpload">
                          <div className="productUploadImg-delete">
                            {images.map((x) => (
                              <div key={x}>
                                <img
                                  src={x}
                                  alt=""
                                  className="productUploadImg wtdh-imgs"
                                />
                                <DeleteIcon
                                  onClick={() => deleteFileHandler(x)}
                                  className="deleteImages"
                                />
                              </div>
                            ))}
                          </div>
                          <label
                            htmlFor="files"
                            className="products-images-upload"
                          >
                            {images.length === 0 && (
                              <MessageBox>No Image</MessageBox>
                            )}
                            {images && loadingUpload && (
                              <LoadingBox></LoadingBox>
                            )}
                            <PublishIcon
                              className="upload-btn images-list-l"
                              onChange={(e) => uploadFileHandler(e, true)}
                            />
                          </label>
                          <input
                            style={{ display: "none" }}
                            type="file"
                            id="files"
                            onChange={(e) => uploadFileHandler(e, true)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="lower_test">
                      <label htmlFor="">Description</label>
                      <JoditEditor
                        className="editor"
                        id="desc"
                        ref={editor}
                        value={desc}
                        // config={config}
                        tabIndex={1} // tabIndex of textarea
                        onBlur={(newContent) => setDesc(newContent)} // preferred to use only this option to update the content for performance reasons
                        onChange={(newContent) => {}}
                      />
                    </div>
                    <button className="productButton">Update All</button>
                  </form>
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

export default ProductEdit;
