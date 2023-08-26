
import requests
from bs4 import BeautifulSoup
import time
from concurrent.futures import ThreadPoolExecutor

headers = {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:76.0) Gecko/20100101 Firefox/76.0'}

def google_search(gas_station_list):
    for gas_station in gas_station_list:
        try:
            if 'oops' in gas_station:
                gas_station = gas_station.replace('oops', 'Mr Gas')
            if 'Circle K' in gas_station:
                gas_station = (gas_station + 'gas')
            response = requests.get(f'https://www.google.com/search?q={gas_station}', headers=headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            price = soup.find_all("td", {'class': 'SZh0Ab'}, limit=1)
            price = str(price[0].text)
            price = price.split('$', 1)[1]
            print(price)
        except:
            print('station price not found')
            pass

def get_station_links(gas_station):
    global x
    global fuel_type_v
    try:
        if 'Oops' in gas_station:
            gas_station = gas_station.replace('Oops', 'Mr Gas')

        response = requests.get(f'https://www.google.com/search?q={gas_station} gas', headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        links = soup.find_all('a', href=True)

        for link in links:
            if 'gasbuddy' in link["href"]:
                site = link["href"]
                response = requests.get(site, headers=headers)
                soup = BeautifulSoup(response.content, 'html.parser')
                price = soup.find_all("span", {'class': 'FuelTypePriceDisplay-module__price___3iizb'}, limit=4)
                price = str(price[int(fuel_type_v)].text)
                price = price.split('¢', 1)[0]
                print(price)
                if x not in index_values:
                    if price != '- - -':
                        station_prices.append(price)
                        index_values.append(x)           
    except Exception as err:
        print(err)
        print('station price not found', x) 
    x += 1 
    

def gas_buddy_search(gas_station_list, fuel_type):
    global fuel_type_v
    fuel_type_v = fuel_type
    global x 
    x = 0
    print(gas_station_list, 'this the shtlajt')
    global station_prices
    global index_values
    station_prices = []
    index_values = []
    station_prices.clear()
    index_values.clear()
    with ThreadPoolExecutor(max_workers=5) as p:
        p.map(get_station_links, gas_station_list)

    print(index_values, station_prices)
    get_output()
    print(index_values, station_prices)


def sort_list(list1, list2):
    zipped_pairs = []
    zipped_pairs.clear()
    zipped_pairs = zip(list2, list1)
    z = []
    z.clear()
 
    z = [x for _, x in sorted(zipped_pairs)]
    print(z)
 
    return z

def get_output():
    global station_prices
    global index_values
    index_values = sort_list(index_values, station_prices)
    station_prices.sort()
    if float(station_prices[0]) < (float(station_prices[1]) - 3):
        del station_prices[0]
        del index_values[0]
    global first_option
    global second_option
    global third_option
    global fourth_option
    global fifth_option
    global first_option_gas
    global second_option_gas
    global third_option_gas
    global fourth_option_gas
    global fifth_option_gas
    first_option = index_values[0]
    second_option = index_values[1]
    third_option = index_values[2]
    fourth_option = index_values[3]
    fifth_option = index_values[4]
    first_option_gas = station_prices[0]
    second_option_gas = station_prices[1]
    third_option_gas = station_prices[2]
    fourth_option_gas = station_prices[3]
    fifth_option_gas =  station_prices[4]
