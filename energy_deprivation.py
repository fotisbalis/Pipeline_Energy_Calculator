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
    entry_g.delete(0, tk.END)
    entry_v.delete(0, tk.END)
    entry_l.delete(0, tk.END)

    entry_g.insert(0, "9.81")
    entry_v.insert(0, "1.15")

    q_unit.current(0)

    result_v.config(text="-")
    result_re.config(text="-")
    result_f.config(text="-")
    result_j.config(text="-")
    result_hf.config(text="-")

def invalid_input():
    messagebox.showerror("Invalid input", "Expecting positive numeric values.")

def calculate():
    try:
        D_mm = float(entry_d.get())
        Q = float(entry_q.get())
        Ks_mm = float(entry_ks.get())
        g = float(entry_g.get())
        v = float(entry_v.get())
        L = float(entry_l.get())

        if D_mm <= 0 or Q <= 0 or Ks_mm <= 0 or g <= 0 or v <= 0 or L <= 0:
            invalid_input()
            return

        v = v * pow(10, -8)
        D = D_mm * pow(10, -3)
        Ks = Ks_mm * pow(10, -3)
        if q_unit.get() == "m^3/h":
            Q = Q / 3600
        else:
            Q = Q / 1000


        V = (4 * Q) / (math.pi * D**2)
        Re = V * (D / v)
        F = colebrook_white(Re, D, Ks)
        J = (F * V**2) / (D * 2 * g)
        hf = J * L

        result_v.config(text=f"{V:.2f} m/s")
        result_re.config(text=f"{Re:.0f}")
        result_f.config(text=f"{F:.4f}")
        result_j.config(text=f"{J:.4f}")
        result_hf.config(text=f"{hf:.4f}")

    except ValueError:
        invalid_input()

root = tk.Tk()
root.title("Pipe Flow Calculator")
root.geometry("520x420")
root.resizable(True, True)

frame = ttk.Frame(root, padding=20)
frame.pack(fill="both", expand=True)

ttk.Label(frame, text="D:").grid(row=1, column=0, sticky="ew", pady=5)
entry_d = ttk.Entry(frame, width=10)
entry_d.grid(row=1, column=1, pady=5)
ttk.Label(frame, text="mm").grid(row=1, column=2, sticky="ew", pady=5)

ttk.Label(frame, text="Q:").grid(row=2, column=0, sticky="ew", pady=5)
entry_q = ttk.Entry(frame, width=10)
entry_q.grid(row=2, column=1, pady=5)
q_unit = ttk.Combobox(frame, width=8, state="readonly")
q_unit["values"] = ("m^3/h", "L/s")
q_unit.current(0)
q_unit.grid(row=2, column=2, padx=5)

ttk.Label(frame, text="Ks:").grid(row=3, column=0, sticky="ew", pady=5)
entry_ks = ttk.Entry(frame, width=10)
entry_ks.grid(row=3, column=1, pady=5)
ttk.Label(frame, text="mm").grid(row=3, column=2, sticky="ew", pady=5)

ttk.Label(frame, text="g:").grid(row=4, column=0, sticky="ew", pady=5)
entry_g = ttk.Entry(frame, width=10)
entry_g.grid(row=4, column=1, pady=5)
entry_g.insert(0, "9.81")
tk.Label(frame, text="m^2/s").grid(row=4, column=2, sticky="w", pady=5)

tk.Label(frame, text="v:").grid(row=5, column=0, sticky="w", pady=5)
entry_v = ttk.Entry(frame, width=10)
entry_v.grid(row=5, column=1, pady=5)
entry_v.insert(0, "1.15")
tk.Label(frame, text="e-6 m^2/s").grid(row=5, column=2, sticky="w", pady=5)

ttk.Label(frame, text="L:").grid(row=6, column=0, sticky="ew", pady=5)
entry_l = ttk.Entry(frame, width=10)
entry_l.grid(row=6, column=1, pady=5)
ttk.Label(frame, text="m").grid(row=6, column=2, sticky="ew", pady=5)

ttk.Button(frame, text="Calculate", command=calculate).grid(row=7, column=0, pady=15)
ttk.Button(frame, text="Clear", command=clear_fields).grid(row=7, column=1, pady=15)

ttk.Label(frame, text="V:").grid(row=8, column=0, sticky="ew", pady=5)
result_v = ttk.Label(frame, text="-")
result_v.grid(row=8, column=1, sticky="ew", pady=5)

ttk.Label(frame, text="Re:").grid(row=9, column=0, sticky="ew", pady=5)
result_re = ttk.Label(frame, text="-")
result_re.grid(row=9, column=1, sticky="ew", pady=5)

ttk.Label(frame, text="f:").grid(row=10, column=0, sticky="ew", pady=5)
result_f = ttk.Label(frame, text="-")
result_f.grid(row=10, column=1, sticky="ew", pady=5)

ttk.Label(frame, text="J:").grid(row=11, column=0, sticky="ew", pady=5)
result_j = ttk.Label(frame, text="-")
result_j.grid(row=11, column=1, stick="ew", pady=5)

ttk.Label(frame, text="hf:").grid(row=12, column=0, sticky="ew", pady=5)
result_hf = ttk.Label(frame, text="-")
result_hf.grid(row=12, column=1, stick="ew", pady=5)

root.mainloop()