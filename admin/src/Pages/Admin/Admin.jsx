import React from "react";
import { Route, Routes } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import ListProduct from "../../Components/ListProduct/ListProduct";
import AddProduct from "../../Components/AddProduct/AddProduct";
import "./Admin.css";

const Admin = () => {
  return (
    <div className="admin">
      <Sidebar />
      <Routes>
        <Route path="addproduct" element={<AddProduct />} />
        <Route path="listproduct" element={<ListProduct />} />
      </Routes>
    </div>
  );
};

export default Admin;
