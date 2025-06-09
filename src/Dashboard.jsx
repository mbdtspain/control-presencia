import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export default function Dashboard({ session }) {
  const [userData, setUserData] = useState(null);
  const [registros, setRegistros] = useState([]);

  const fetchUserData = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    setUserData(data);
  };

  const fetchRegistros = async () => {
    const { data } = await supabase
      .from('registros')
      .select('*')
      .order('timestamp', { ascending: false });
    setRegistros(data);
  };

  const registrar = async (tipo) => {
    await supabase.from('registros').insert({ tipo, user_id: session.user.id });
    fetchRegistros();
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(registros);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');
    XLSX.writeFile(wb, 'registros.xlsx');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    registros.forEach((r, i) => {
      doc.text(`${r.tipo} - ${r.timestamp}`, 10, 10 + i * 10);
    });
    doc.save('registros.pdf');
  };

  useEffect(() => {
    fetchUserData();
    fetchRegistros();
  }, []);

  if (!userData) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Bienvenido, {userData.nombre} ({userData.rol})</h2>
      <button onClick={() => registrar('entrada')}>Entrada</button>
      <button onClick={() => registrar('salida')}>Salida</button>
      <h3>Registros</h3>
      <ul>
        {registros.map((r) => (
          <li key={r.id}>{r.tipo} - {new Date(r.timestamp).toLocaleString()}</li>
        ))}
      </ul>
      <button onClick={exportarExcel}>Exportar Excel</button>
      <button onClick={exportarPDF}>Exportar PDF</button>
    </div>
  );
}