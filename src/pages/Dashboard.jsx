import { useState, useEffect } from "react";
import { LineChart, BarChart, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import React from "react";

function ProductDashboard() {
  
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [resumenProductos, setResumenProductos] = useState([]);
  const [dataDesviacion, setDataDesviacion] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  const colors = {
    palette: [
      "#00a89c", "#9654e5", "#ff8800", "#e74c3c", "#3498db", 
      "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#34495e",
      "#e67e22", "#95a5a6", "#16a085", "#27ae60", "#2980b9",
      "#8e44ad", "#f1c40f", "#e74c3c", "#ecf0f1", "#bdc3c7"
    ]
  };

  const getColor = (index) => {
    return colors.palette[index % colors.palette.length];
  };

  const getDarkColor = (index) => {
    const baseColor = colors.palette[index % colors.palette.length];
    // Simple way to darken color - in real app you might use a color manipulation library
    return baseColor.replace('#', '#').slice(0, 7);
  };

  // Extract products dynamically from column headers
  const extractProductsFromData = (jsonData) => {
    if (!jsonData || jsonData.length === 0) return [];
    
    const firstRow = jsonData[0];
    const productSet = new Set();
    
    Object.keys(firstRow).forEach(key => {
      if (key.startsWith('Meta ') || key.startsWith('Real ')) {
        const productName = key.replace('Meta ', '').replace('Real ', '');
        productSet.add(productName);
      }
    });
    
    return Array.from(productSet).sort();
  };

  const transformarDatos = (jsonData, productList) => {
    const registros = [];

    jsonData.forEach((fila) => {
      productList.forEach((producto) => {
        registros.push({
          producto,
          mes: fila.mes,
          meta: Number(fila[`Meta ${producto}`]) || 0,
          ventas: Number(fila[`Real ${producto}`]) || 0,
        });
      });
    });

    return registros;
  };

  const calcularResumenProductos = (datos, productList) => {
    const agrupado = {};

    datos.forEach((item) => {
      if (!agrupado[item.producto]) {
        agrupado[item.producto] = [];
      }
      agrupado[item.producto].push(item);
    });

    return productList.map((producto, index) => {
      const registros = agrupado[producto] || [];
      const metaTotal = registros.reduce((acc, r) => acc + r.meta, 0);
      const ventasTotal = registros.reduce((acc, r) => acc + r.ventas, 0);
      const desviacion = metaTotal > 0 ? +((ventasTotal - metaTotal) / metaTotal * 100).toFixed(2) : 0;
      const mesesPositivos = registros.filter((r) => r.ventas >= r.meta).length;
      const totalMeses = registros.length;

      return {
        producto: `Producto ${producto}`, 
        metaTotal: +metaTotal.toFixed(2),
        ventasTotal: +ventasTotal.toFixed(2),
        desviacion,
        mesesPositivos,
        totalMeses,
        color: getColor(index),
      };
    });
  };
  
  // Calculate deviations dynamically
  const calculateDeviations = (data, productList) => {
    return data.map(item => {
      const result = { mes: item.mes };
      
      productList.forEach(product => {
        const real = Number(item[`Real ${product}`]) || 0;
        const meta = Number(item[`Meta ${product}`]) || 0;
        const deviation = meta > 0 ? ((real - meta) / meta * 100) : 0;
        result[`Producto ${product}`] = deviation;
      });
      
      return result;
    });
  };

  // Process data when products or data changes
  useEffect(() => {
    if (data.length > 0 && products.length > 0) {
      setIsLoading(true);
      
      // Simulate processing time for better UX
      setTimeout(() => {
        try {
          const registrosTransformados = transformarDatos(data, products);
          const resumen = calcularResumenProductos(registrosTransformados, products);
          const desviaciones = calculateDeviations(data, products);
          
          setResumenProductos(resumen);
          setDataDesviacion(desviaciones);
          setDataReady(true);
        } catch (error) {
          console.error("Error processing data:", error);
          alert("Error al procesar los datos.");
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } else {
      setDataReady(false);
      setResumenProductos([]);
      setDataDesviacion([]);
    }
  }, [data, products]);

  const handleProductToggle = (product) => {
    setSelectedProducts({
      ...selectedProducts,
      [product]: !selectedProducts[product]
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setDataReady(false);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          alert("El archivo Excel está vacío.");
          setIsLoading(false);
          return;
        }

        const detectedProducts = extractProductsFromData(jsonData);
        
        if (detectedProducts.length === 0) {
          alert("No se encontraron productos válidos. Asegúrate de que las columnas sigan el formato 'Meta [Producto]' y 'Real [Producto]'.");
          setIsLoading(false);
          return;
        }

        const firstRow = jsonData[0];
        const missingColumns = [];
        detectedProducts.forEach(product => {
          if (!(`Meta ${product}` in firstRow)) missingColumns.push(`Meta ${product}`);
          if (!(`Real ${product}` in firstRow)) missingColumns.push(`Real ${product}`);
        });

        if (missingColumns.length > 0) {
          alert(`Faltan las siguientes columnas en el archivo Excel: ${missingColumns.join(', ')}`);
          setIsLoading(false);
          return;
        }

        if (!('mes' in firstRow)) {
          alert("Falta la columna 'mes' en el archivo Excel.");
          setIsLoading(false);
          return;
        }

        console.log(`Detected ${detectedProducts.length} products:`, detectedProducts);

        setData(jsonData);
        setProducts(detectedProducts);
        
        const initialSelection = {};
        detectedProducts.forEach(product => {
          initialSelection[`Producto ${product}`] = true;
        });
        setSelectedProducts(initialSelection);

      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error al procesar el archivo. Asegúrate de que sea un archivo Excel válido con la estructura correcta.");
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Filter resumenProductos based on selected products
  const filteredResumenProductos = resumenProductos.filter(p => 
    selectedProducts[p.producto]
  );

  // Generate Lines for the chart
  const generateLines = () => {
    const lines = [];
    
    products.forEach((product, index) => {
      if (!selectedProducts[`Producto ${product}`]) return;
      
      const color = getColor(index);
      const darkColor = color;
      
      // Meta line (dashed)
      lines.push(
        <Line 
          key={`meta-${product}`}
          type="monotone" 
          dataKey={`Meta ${product}`} 
          name={`Meta ${product}`} 
          stroke={darkColor} 
          strokeWidth={2}
          strokeDasharray="5 5" 
          dot={{ r: 3, fill: darkColor }} 
          activeDot={{ r: 5, fill: darkColor }}
        />
      );
      
      // Real line (solid)
      lines.push(
        <Line 
          key={`real-${product}`}
          type="monotone" 
          dataKey={`Real ${product}`} 
          name={`Real ${product}`} 
          stroke={color} 
          strokeWidth={2} 
          dot={{ r: 3, fill: color }} 
          activeDot={{ r: 5, fill: color }}
        />
      );
    });
    
    return lines;
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      backgroundColor: '#f9fafb', 
      padding: '24px', 
      borderRadius: '8px' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '30px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '8px' 
        }}>
          Dashboard de Rendimiento de Productos
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#4b5563' 
        }}>
          Análisis comparativo de metas y ventas reales
        </p>
      </div>

      {/* File Upload */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#374151' 
        }}>
          Cargar archivo Excel:
        </label>
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileUpload}
          disabled={isLoading}
          style={{
            display: 'block',
            width: '100%',
            fontSize: '14px',
            color: isLoading ? '#9ca3af' : '#111827',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            backgroundColor: isLoading ? '#f3f4f6' : 'white',
            padding: '8px 12px'
          }}
        />
        {products.length > 0 && (
          <p style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginTop: '4px' 
          }}>
            Productos detectados: {products.join(', ')} ({products.length} total)
          </p>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'inline-block',
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p style={{
            fontSize: '16px',
            color: '#4b5563',
            fontWeight: '500'
          }}>
            Procesando datos...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Product Filters */}
      {products.length > 0 && dataReady && !isLoading && (
        <div style={{ 
          marginBottom: '24px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}>
          <span style={{ 
            fontWeight: '600', 
            color: '#374151', 
            alignSelf: 'center' 
          }}>
            Filtrar productos:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {products.map((product, index) => (
              <button 
                key={product}
                onClick={() => handleProductToggle(`Producto ${product}`)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  backgroundColor: selectedProducts[`Producto ${product}`] ? getColor(index) : "#9CA3AF"
                }}
              >
                Producto {product}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {dataReady && !isLoading && data.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
          gap: '32px' 
        }}>
          {/* Chart 1: Goals vs Actual Sales */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '4px' 
            }}>
              Tendencia de Ventas: Meta vs Real
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginBottom: '16px' 
            }}>
              Comparativa mensual de objetivos y resultados
            </p>
            <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={data} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fontSize: 12 }} 
                    height={60}
                  />
                  <YAxis 
                    label={{ 
                      value: 'USD (K)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      style: { textAnchor: 'middle', fontSize: 12 } 
                    }} 
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value}K USD`, name]} 
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  
                  {/* Dynamic Product Lines */}
                  {generateLines()}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div> 

          {/* Chart 2: Percentage Deviation */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '4px' 
            }}>
              Desviación Porcentual vs Meta
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginBottom: '16px' 
            }}>
              Rendimiento mensual por encima/debajo del objetivo
            </p>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%" >
                <ComposedChart data={dataDesviacion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis 
                    label={{ value: '%', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => { 
                    if (typeof value === 'number') {
                      return value.toFixed(2) + '%';  
                    }   
                    return value;
                  }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  
                  {products.map((product, index) => {
                    if (!selectedProducts[`Producto ${product}`]) return null;
                    
                    return (
                      <Bar 
                        key={product}
                        dataKey={`Producto ${product}`} 
                        name={`Producto ${product}`} 
                        fill={getColor(index)}
                        barSize={Math.max(15, Math.min(30, 300 / products.length))}
                      />
                    );
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Annual Summary by Product */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            gridColumn: '1 / -1'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '4px' 
            }}>
              Desempeño Anual por Producto
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginBottom: '16px' 
            }}>
              Comparativa de metas anuales vs ventas acumuladas
            </p>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredResumenProductos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="producto" tick={{ fontSize: 12 }} />
                  <YAxis 
                    label={{ value: 'USD (K)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === "metaTotal") return [`${value}K USD`, "Meta Anual"];
                      if (name === "ventasTotal") return [`${value}K USD`, "Ventas Anuales"];
                      if (name === "desviacion") return [`${typeof value === 'number' ? value.toFixed(2) : value}%`, "Desviación"];
                      return [value, name];
                    }}
                  />  
                  <Legend 
                    payload={[
                      { value: 'Meta Anual', type: 'rect', color: '#8884d8' },
                      { value: 'Ventas Anuales', type: 'rect', color: '#82ca9d' }
                    ]}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="metaTotal" name="metaTotal" fill="#8884d8" barSize={Math.max(30, Math.min(60, 500 / filteredResumenProductos.length))} />
                  <Bar dataKey="ventasTotal" name="ventasTotal" fill="#82ca9d" barSize={Math.max(30, Math.min(60, 500 / filteredResumenProductos.length))} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* KPIs and Key Metrics */}
      {dataReady && !isLoading && filteredResumenProductos.length > 0 && (
        <div style={{ 
          marginTop: '32px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {filteredResumenProductos.map((prod) => (
            <div 
              key={prod.producto} 
              style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderLeft: `4px solid ${prod.color}`
              }}
            >
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#1f2937' 
              }}>
                {prod.producto}
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px 0', 
                marginTop: '12px' 
              }}>
                <div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
                    Meta anual
                  </p>
                  <p style={{ 
                    fontSize: '18px', 
                    fontWeight: '600' 
                  }}>
                    {prod.metaTotal}K USD
                  </p>
                </div>
                <div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
                    Ventas reales
                  </p>
                  <p style={{ 
                    fontSize: '18px', 
                    fontWeight: '600' 
                  }}>
                    {prod.ventasTotal}K USD
                  </p>
                </div>
                <div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
                    Desviación
                  </p>
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: prod.desviacion >= 0 ? '#059669' : '#dc2626'
                  }}>
                    {prod.desviacion.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
                    Meses positivos
                  </p>
                  <p style={{ 
                    fontSize: '18px', 
                    fontWeight: '600' 
                  }}>
                    {prod.mesesPositivos} / {prod.totalMeses}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions when no data */}
      {!isLoading && data.length === 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '32px', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center' 
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '8px' 
          }}>
            Sube un archivo Excel para comenzar
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280' 
          }}>
            El archivo debe contener columnas con formato: 'mes', 'Meta [Producto]', 'Real [Producto]' para cada producto.
            <br />
            Ejemplo: mes, Meta A, Real A, Meta B, Real B, etc.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductDashboard;