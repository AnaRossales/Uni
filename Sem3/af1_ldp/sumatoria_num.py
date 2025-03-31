import time
start_time = time.time()

n = 1000000
suma = sum(range(1, n+1))

end_time = time.time()

print("La suma de los primeros 1,000,000 de números naturales es:", suma)
print("Tiempo de ejecución:", end_time - start_time, "segundos")
