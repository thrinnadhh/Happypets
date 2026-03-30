import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#111" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666", marginBottom: 20 },
  section: { marginBottom: 16 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 120, color: "#666" },
  value: { flex: 1 },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: 6, borderRadius: 2 },
  tableRow: { flexDirection: "row", padding: 6, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1, textAlign: "right" },
  col4: { flex: 1, textAlign: "right" },
  total: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  totalLabel: { width: 120, fontWeight: "bold" },
  totalValue: { width: 80, textAlign: "right", fontWeight: "bold" },
  bold: { fontWeight: "bold" },
  divider: { borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb", marginVertical: 12 },
});

interface InvoiceItem {
  name: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  total: number;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  shop: { name: string; gstNumber: string | null };
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  razorpayPaymentId?: string;
}

function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export function GSTInvoice({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.title}>TheHappyPets</Text>
          <Text style={styles.subtitle}>Tax Invoice</Text>
        </View>

        {/* Order info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice No:</Text>
            <Text style={[styles.value, styles.bold]}>{data.orderNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{data.orderDate}</Text>
          </View>
          {data.shop.gstNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Seller GSTIN:</Text>
              <Text style={styles.value}>{data.shop.gstNumber}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Sold by:</Text>
            <Text style={styles.value}>{data.shop.name}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Customer */}
        <View style={styles.section}>
          <Text style={[styles.bold, { marginBottom: 4 }]}>Bill To</Text>
          <Text>{data.customer.name}</Text>
          <Text>{data.customer.phone}</Text>
          <Text>{data.customer.address}</Text>
          <Text>{data.customer.city}, {data.customer.state} - {data.customer.pincode}</Text>
        </View>

        <View style={styles.divider} />

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Item</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>GST%</Text>
            <Text style={styles.col4}>Amount</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.col1}>
                <Text>{item.name}</Text>
                {item.variantName ? <Text style={{ color: "#666" }}>{item.variantName}</Text> : null}
              </View>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{item.gstRate}%</Text>
              <Text style={styles.col4}>{formatINR(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={{ marginTop: 16 }}>
          {[
            { label: "Subtotal", value: formatINR(data.subtotal) },
            { label: "GST", value: formatINR(data.gstAmount) },
            { label: "Shipping", value: formatINR(data.shipping) },
            ...(data.discount > 0 ? [{ label: "Discount", value: `-${formatINR(data.discount)}` }] : []),
          ].map((line) => (
            <View key={line.label} style={[styles.row, { justifyContent: "flex-end" }]}>
              <Text style={[styles.label, { textAlign: "right" }]}>{line.label}:</Text>
              <Text style={[styles.value, { textAlign: "right", width: 80 }]}>{line.value}</Text>
            </View>
          ))}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatINR(data.total)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Payment:</Text>
            <Text style={styles.value}>{data.paymentMethod}</Text>
          </View>
          {data.razorpayPaymentId && (
            <View style={styles.row}>
              <Text style={styles.label}>Reference ID:</Text>
              <Text style={styles.value}>{data.razorpayPaymentId}</Text>
            </View>
          )}
        </View>

        <Text style={{ fontSize: 8, color: "#999", marginTop: 24, textAlign: "center" }}>
          This is a computer-generated invoice. No signature required.
        </Text>
      </Page>
    </Document>
  );
}
