import { useEffect, useState } from "react";

import MyBalance from "../components/transactions/MyBalance";
import MyIncome from "../components/transactions/MyIncome";
import MyExpense from "../components/transactions/MyExpense";
import TotalTransactions from "../components/transactions/TotalTransactions";
import TransactionHistory from "../components/transactions/TransactionHistory";

import "../styles/balance.css";



import { FaRegCalendarAlt } from "react-icons/fa";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import api from "../service/api";
import { useParams } from "react-router-dom";
import CategoryGraphic from "../components/graphics/CategoryGraphic";
import Greeting from "../components/utils/Greeting";
import MyProducts from "../components/product/MyProducts";
import MyCategory from "../components/category/MyCategory";
import { useScrollPosition } from "../hooks/useScrollRestoration";


interface TransactionBalanceMonthResponse {
  income: number;
  expense: number;
}


function Dashboard() {
  useScrollPosition("dashboard");

  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [balanceData, setBalanceData] = useState<TransactionBalanceMonthResponse | null>(null);

  const { familyId } = useParams();


  useEffect(() => {

    async function loadBalance() {

      const response = await api.get<TransactionBalanceMonthResponse>(
        `/transactions/balance/family/${familyId}`,
        {
          params: {
            year,
            month
          }
        }
      );

      setBalanceData(response.data);
    }


    loadBalance();

  }, [month, year]);



  function previousMonth() {

    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }

  }



  function nextMonth() {

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();


    if (
      year > currentYear ||
      (year === currentYear && month >= currentMonth)
    ) {
      return;
    }


    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }

  }



  const monthName = new Intl.DateTimeFormat(
    "pt-BR",
    { month: "long" }
  ).format(new Date(year, month - 1));



  return (
    <>

      <div className="dashboard-header">

        <Greeting />


        <div className="header-actions">


          <div className="header-icon-box">
            <FaRegCalendarAlt className="header-icon" />
          </div>


          <div className="header-icon-box">
            <IoIosNotificationsOutline className="header-icon" />
          </div>



          <div className="btn-header-box">

            <button onClick={previousMonth}>
              <FaChevronLeft />
            </button>


            <span>
              {monthName} {year}
            </span>


            <button
              onClick={nextMonth}
              disabled={
                year === today.getFullYear() &&
                month === today.getMonth() + 1
              }
            >
              <FaChevronRight />
            </button>

          </div>


        </div>

      </div>



      <div className="dashboard-lay">

        <MyBalance />

        <MyIncome
          value={balanceData?.income}
        />

        <MyExpense
          value={balanceData?.expense}
        />

        <TotalTransactions />
        <CategoryGraphic
          familyId={familyId}
          year={year}
          month={month}
        />
        
        <TransactionHistory/>
        <MyProducts/>
        <MyCategory/>
        

      </div>


    </>
  );
}


export default Dashboard;