"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUserData, clearUserData } from "@/redux/userSlice";
import { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";

export const useGetMe = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.userData);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (status === "authenticated") {
        try {
          const response = await axios.get("/api/me");
          const user = response.data;
          dispatch(
            setUserData({
              id: user._id || user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              mobile: user.mobile,
              image: user.image,
              location: user.location,
              socketId: user.socketId,
              isOnline: user.isOnline,
            })
          );
        } catch (error) {
          console.error("Failed to fetch profile in useGetMe:", error);
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        dispatch(clearUserData());
        setLoading(false);
      } else {
        setLoading(true);
      }
    };

    fetchMe();
  }, [status, dispatch]);

  return { userData, loading };
};
export default useGetMe;
