import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator as CalcIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type CalcType = "sip" | "lumpsum" | "emi" | "tax" | "gst" | "tds";

const tabs: { id: CalcType; label: string }[] = [
  { id: "sip", label: "SIP" },
  { id: "lumpsum", label: "Lumpsum" },
  { id: "emi", label: "Home Loan EMI" },
  { id: "tax", label: "Income Tax" },
  { id: "gst", label: "GST" },
  { id: "tds", label: "TDS" },
];

const Slider = ({ label, value, onChange, min, max, step, prefix = "", suffix = "" }: any) => (
  <div className="mb-5">
    <div className="flex justify-between text-sm mb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{prefix}{value.toLocaleString()}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-secondary accent-primary cursor-pointer"
    />
  </div>
);

const ResultCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-secondary/50 p-4 text-center">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-lg font-bold text-primary">{value}</p>
  </div>
);

const Calculators = () => {
  const [active, setActive] = useState<CalcType>("sip");
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(12);
  const [lumpAmount, setLumpAmount] = useState(100000);
  const [lumpYears, setLumpYears] = useState(10);
  const [lumpRate, setLumpRate] = useState(12);
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [loanYears, setLoanYears] = useState(20);
  const [loanRate, setLoanRate] = useState(8.5);
  const [income, setIncome] = useState(1200000);
  const [gstAmount, setGstAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18);
  const [tdsAmount, setTdsAmount] = useState(50000);
  const [tdsRate, setTdsRate] = useState(10);

  const sipResult = useMemo(() => {
    const n = sipYears * 12;
    const r = sipRate / 12 / 100;
    const fv = sipAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = sipAmount * n;
    return { total: Math.round(fv), invested, gains: Math.round(fv - invested) };
  }, [sipAmount, sipYears, sipRate]);

  const lumpResult = useMemo(() => {
    const fv = lumpAmount * Math.pow(1 + lumpRate / 100, lumpYears);
    return { total: Math.round(fv), invested: lumpAmount, gains: Math.round(fv - lumpAmount) };
  }, [lumpAmount, lumpYears, lumpRate]);

  const emiResult = useMemo(() => {
    const r = loanRate / 12 / 100;
    const n = loanYears * 12;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { emi: Math.round(emi), total: Math.round(emi * n), interest: Math.round(emi * n - loanAmount) };
  }, [loanAmount, loanYears, loanRate]);

  const taxResult = useMemo(() => {
    let tax = 0;
    const i = income;
    if (i > 1500000) tax += (i - 1500000) * 0.3;
    if (i > 1250000) tax += Math.min(i - 1250000, 250000) * 0.25;
    if (i > 1000000) tax += Math.min(i - 1000000, 250000) * 0.2;
    if (i > 750000) tax += Math.min(i - 750000, 250000) * 0.15;
    if (i > 500000) tax += Math.min(i - 500000, 250000) * 0.1;
    if (i > 300000) tax += Math.min(i - 300000, 200000) * 0.05;
    return { tax: Math.round(tax), effective: ((tax / income) * 100).toFixed(1) };
  }, [income]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Financial Calculators</h1>
        <p className="text-muted-foreground mb-8">Plan your finances with powerful calculators</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto mb-8 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === tab.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8">
        {active === "sip" && (
          <>
            <Slider label="Monthly Investment" value={sipAmount} onChange={setSipAmount} min={500} max={100000} step={500} prefix="₹" />
            <Slider label="Expected Return" value={sipRate} onChange={setSipRate} min={1} max={30} step={0.5} suffix="%" />
            <Slider label="Time Period" value={sipYears} onChange={setSipYears} min={1} max={30} step={1} suffix=" years" />
            <div className="grid grid-cols-3 gap-3 mt-6">
              <ResultCard label="Invested" value={`₹${sipResult.invested.toLocaleString()}`} />
              <ResultCard label="Returns" value={`₹${sipResult.gains.toLocaleString()}`} />
              <ResultCard label="Total Value" value={`₹${sipResult.total.toLocaleString()}`} />
            </div>
          </>
        )}
        {active === "lumpsum" && (
          <>
            <Slider label="Investment Amount" value={lumpAmount} onChange={setLumpAmount} min={1000} max={10000000} step={10000} prefix="₹" />
            <Slider label="Expected Return" value={lumpRate} onChange={setLumpRate} min={1} max={30} step={0.5} suffix="%" />
            <Slider label="Time Period" value={lumpYears} onChange={setLumpYears} min={1} max={30} step={1} suffix=" years" />
            <div className="grid grid-cols-3 gap-3 mt-6">
              <ResultCard label="Invested" value={`₹${lumpResult.invested.toLocaleString()}`} />
              <ResultCard label="Returns" value={`₹${lumpResult.gains.toLocaleString()}`} />
              <ResultCard label="Total Value" value={`₹${lumpResult.total.toLocaleString()}`} />
            </div>
          </>
        )}
        {active === "emi" && (
          <>
            <Slider label="Loan Amount" value={loanAmount} onChange={setLoanAmount} min={100000} max={50000000} step={100000} prefix="₹" />
            <Slider label="Interest Rate" value={loanRate} onChange={setLoanRate} min={5} max={20} step={0.1} suffix="%" />
            <Slider label="Loan Tenure" value={loanYears} onChange={setLoanYears} min={1} max={30} step={1} suffix=" years" />
            <div className="grid grid-cols-3 gap-3 mt-6">
              <ResultCard label="Monthly EMI" value={`₹${emiResult.emi.toLocaleString()}`} />
              <ResultCard label="Total Interest" value={`₹${emiResult.interest.toLocaleString()}`} />
              <ResultCard label="Total Amount" value={`₹${emiResult.total.toLocaleString()}`} />
            </div>
          </>
        )}
        {active === "tax" && (
          <>
            <Slider label="Annual Income" value={income} onChange={setIncome} min={300000} max={10000000} step={50000} prefix="₹" />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <ResultCard label="Tax (New Regime)" value={`₹${taxResult.tax.toLocaleString()}`} />
              <ResultCard label="Effective Rate" value={`${taxResult.effective}%`} />
            </div>
          </>
        )}
        {active === "gst" && (
          <>
            <Slider label="Amount" value={gstAmount} onChange={setGstAmount} min={100} max={1000000} step={100} prefix="₹" />
            <Slider label="GST Rate" value={gstRate} onChange={setGstRate} min={5} max={28} step={1} suffix="%" />
            <div className="grid grid-cols-3 gap-3 mt-6">
              <ResultCard label="GST Amount" value={`₹${Math.round(gstAmount * gstRate / 100).toLocaleString()}`} />
              <ResultCard label="Total" value={`₹${Math.round(gstAmount * (1 + gstRate / 100)).toLocaleString()}`} />
              <ResultCard label="Rate" value={`${gstRate}%`} />
            </div>
          </>
        )}
        {active === "tds" && (
          <>
            <Slider label="Payment Amount" value={tdsAmount} onChange={setTdsAmount} min={1000} max={1000000} step={1000} prefix="₹" />
            <Slider label="TDS Rate" value={tdsRate} onChange={setTdsRate} min={1} max={30} step={0.5} suffix="%" />
            <div className="grid grid-cols-3 gap-3 mt-6">
              <ResultCard label="TDS Deducted" value={`₹${Math.round(tdsAmount * tdsRate / 100).toLocaleString()}`} />
              <ResultCard label="Net Amount" value={`₹${Math.round(tdsAmount * (1 - tdsRate / 100)).toLocaleString()}`} />
              <ResultCard label="Rate" value={`${tdsRate}%`} />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Calculators;
