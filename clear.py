import pandas as pd
import numpy as np 

visas = pd.read_csv('./data/h1b_kaggle.csv', sep=',')
visas = pd.DataFrame(visas, columns=['CASE_STATUS', 'EMPLOYER_NAME', 'YEAR'])
years = ['2014.0', '2015.0', '2016.0']
filtered = visas.loc[visas['YEAR'].isin(years)]
# print(filtered.shape)
filtered.to_csv('./data/data.csv')