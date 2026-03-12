import { useEffect, useState } from "react";

export default function Footer() {

  const [footer, setFooter] = useState<any>(null);

  useEffect(() => {
    fetch("http://100.53.25.60:8080/api/footer")
      .then(res => res.json())
      .then(data => setFooter(data));
  }, []);

  if (!footer) return null;

  return (
    <footer className="bg-gray-900 text-white p-6 mt-20">
      <div className="max-w-7xl mx-auto text-center">

        <p className="font-bold text-lg">{footer.companyName}</p>

        <p>GST: {footer.gstNumber}</p>

        <p>{footer.sebiRegistration}</p>

        <p>{footer.address}</p>

        <p>Email: {footer.email}</p>

        <p>Phone: {footer.phone}</p>

        <p className="mt-4 text-gray-400">{footer.copyright}</p>

      </div>
    </footer>
  );
}