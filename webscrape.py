
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
    global fuel_type_v
    try:
        if 'Oops' in gas_station:
            gas_station = gas_station.replace('Oops', 'Mr Gas')

        response = requests.get(f'https://www.google.com/search?q={gas_station} gas', headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        links = soup.find_all('a', href=True)
        print(gas_station)
        for link in links:
            if 'gasbuddy' in link["href"]:
                site = link["href"]
                response = requests.get(site, headers=headers)
                soup = BeautifulSoup(response.content, 'html.parser')
                price = soup.find_all("span", {'class': 'FuelTypePriceDisplay-module__price___3iizb'}, limit=4)
                price = str(price[int(fuel_type_v)].text)
                price = price.split('¢', 1)[0]
                print(price)
                if gas_station not in repeated_values:
                    if price != '- - -':
                        station_prices.append(Stations_Prices(price, gas_station))
                        repeated_values.append(gas_station)    

    except Exception as err:
        print(err)
        print('station price not found', x) 
    
class Stations:
    def __init__(self, index, name):
        self.index = index
        self.name = name

class Stations_Prices:
    def __init__(self, price, name):
        self.price = price
        self.name = name

final_gas_stations_list = []

def gas_buddy_search(gas_station_list, fuel_type):
    global fuel_type_v
    fuel_type_v = fuel_type
    x = 0

    for places in gas_station_list:
        print(places)
        final_gas_stations_list.append(Stations(x, places))
        x += 1

    global station_prices
    global repeated_values

    repeated_values = []
    station_prices = []

    global index_values
    global price_list

    index_values = []
    price_list = []

    station_prices.clear()
    index_values.clear()
    repeated_values.clear()
    price_list.clear()

    
    with ThreadPoolExecutor(max_workers=5) as p:
        p.map(get_station_links, gas_station_list)
    
    for obj in station_prices:
        for value in final_gas_stations_list:
            if value.name == obj.name:
                price_list.append(obj.price)
                index_values.append(value.index)

    
    print(index_values, price_list)
    get_output()
    print(index_values, price_list)


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
    global price_list
    global index_values
    index_values = sort_list(index_values, price_list)
    price_list.sort()
    if float(price_list[0]) < (float(price_list[1]) - 3):
        del price_list[0]
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
    first_option_gas = price_list[0]
    second_option_gas = price_list[1]
    third_option_gas = price_list[2]
    fourth_option_gas = price_list[3]
    fifth_option_gas =  price_list[4]
