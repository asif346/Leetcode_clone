import { BrowserRouter, Navigate, Route, Routes,} from "react-router";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

function App() {

  //  check if user is authenticate or not
  const {isAuthenticated} = useSelector((state)=>state.auth);
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch]);

  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={isAuthenticated ?<HomePage></HomePage> : <Navigate to={'/signup'}></Navigate>}></Route>
        <Route path="/login" element={isAuthenticated ? <Navigate to={'/'}/> : <Login></Login>}></Route>
        <Route path="/signup" element={isAuthenticated ? <Navigate to={'/'}/> : <Signup></Signup>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
