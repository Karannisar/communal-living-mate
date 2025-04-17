
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SecurityPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Security features have been integrated into the Admin dashboard
    navigate('/admin');
  }, [navigate]);
  
  return null;
};

export default SecurityPage;
