import pandas as pd
import numpy as np 

visas = pd.read_csv('./data/h1b_kaggle.csv', sep=',')
visas = visas[['CASE_STATUS', 'EMPLOYER_NAME', 'YEAR']]
# print(filtered.shape)
# filtered.to_csv('./data/data.csv')
# visas['passed'] = visas['CASE_STATUS'] == 'CERTIFIED'
# print(visas.head(30))
# print(visas.groupby('EMPLOYER_NAME')['passed'].sum().nlargest(10))
top10_names = ['INFOSYS LIMITED', 'TATA CONSULTANCY SERVICES LIMITED', 'WIPRO LIMITED', 'ACCENTURE LLP', 'DELOITTE CONSULTING LLP', 'IBM INDIA PRIVATE LIMITED', 'CAPGEMINI AMERICA INC', 
                'HCL AMERICA, INC.', 'ERNST & YOUNG U.S. LLP', 'MICROSOFT CORPORATION']
top10 = visas.loc[visas['EMPLOYER_NAME'].isin(top10_names)]
top10.to_csv('./data/top.csv')