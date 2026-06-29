import math
import tkinter as tk
from tkinter import ttk, messagebox

def colebrook_white(Re, D, Ks):
    f = 0.01
    while True:
        tmp_f = (1 / (-2 * (math.log10((Ks / (3.7 * D)) + (2.51 / (Re * math.sqrt(f)))))))**2

        if abs(f - tmp_f) < pow(10, -8):
            break

        f = tmp_f
    return f

def clear_fields():
    entry_d.delete(0, tk.END)
    entry_q.delete(0, tk.END)
    entry_ks.delete(0, tk.END)

    result_v.config(text="-")
    result_j.config(text="-")

def calculate():
    try:
        D_mm = float(entry_d.get())
        Q_h = float(entry_q.get())
        Ks_mm = float(entry_ks.get())

        if D_mm <= 0 or Q_h <= 0 or Ks_mm <= 0 :
            messagebox.showerror("Invalid input", "Expecting positive numeric values.")
            return

        g = 9.81
        v = 1.31 * pow(10, -8)
        D = D_mm * pow(10, -3)
        Ks = Ks_mm * pow(10, -3)
        Q = Q_h / 3600

        V = (4 * Q) / (math.pi * D**2)
        Re = V * (D / v)
        F = colebrook_white(Re, D, Ks)
        J = (F * V**2) / (D * 2 * g)

        result_v.config(text=f"{V:.6f} m/s")
        result_j.config(text=f"{J:.6f}")

    except ValueError:
        messagebox.showerror("Invalid input", "Expecting positive numeric values.")

root = tk.Tk()
root.title("Pipe Flow Calculator")
root.geometry("520x420")
root.resizable(False, False)

frame = ttk.Frame(root, padding=20)
frame.pack(fill="both", expand=True)

ttk.Label(frame, text="D (mm):").grid(row=1, column=0, sticky="w", pady=5)
entry_d = ttk.Entry(frame, width=20)
entry_d.grid(row=1, column=1, pady=5)

ttk.Label(frame, text="Q (m^3/h):").grid(row=2, column=0, sticky="w", pady=5)
entry_q = ttk.Entry(frame, width=20)
entry_q.grid(row=2, column=1, pady=5)

ttk.Label(frame, text="Ks (mm):").grid(row=3, column=0, sticky="w", pady=5)
entry_ks = ttk.Entry(frame, width=20)
entry_ks.grid(row=3, column=1, pady=5)

ttk.Button(frame, text="Calculate", command=calculate).grid(row=4, column=0, pady=15)
ttk.Button(frame, text="Clear", command=clear_fields).grid(row=4, column=1, pady=15)

ttk.Label(frame, text="V:").grid(row=5, column=0, sticky="w", pady=5)
result_v = ttk.Label(frame, text="-")
result_v.grid(row=5, column=1, sticky="w", pady=5)

ttk.Label(frame, text="J:").grid(row=7, column=0, sticky="w", pady=5)
result_j = ttk.Label(frame, text="-")
result_j.grid(row=7, column=1, stick ="w", pady=5)

root.mainloop()