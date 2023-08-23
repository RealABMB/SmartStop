from flask import Flask, render_template, request, redirect, jsonify
app = Flask(__name__)
import sys
gas_station_list = []
km_availiable = 2
first_time = True
#import camera
import time
route_km = 0
verdict = ''
need_gas = False
#test


@app.route("/")
def map():
    return render_template('map.html')

@app.route("/km_check", methods=['POST', 'GET'])
def km_check():
    global km_availiable
    km_availiable = -1
    value = request.form['numberValue']
    #camera.pictureSearch(pic_link)
    #time.sleep(0.5)
    #try:    
        #km_availiable = camera.kilometers
        #print(km_availiable)
        #return redirect(request.referrer)
    #except:
        #print('no')
    km_availiable = int(value)
    return redirect(request.referrer)

    

@app.route("/distance_mesure", methods=['POST', 'GET'])
def distance_mesure():
    global route_km 
    route_km = request.form['distance'] 
    route_km = float(route_km)/1000
    print(route_km)
    return redirect(request.referrer)

@app.route("/type_input", methods=['POST', 'GET'])
def type_input():
    global fuel_type
    fuel_type = request.form['fuelType']
    print(fuel_type, 'this is the value of fuel')
    return redirect(request.referrer)

@app.route("/km_object", methods=['POST', 'GET'])
def km_object():
    global route_km
    if km_availiable == -1:
        return{'value': 'Try Again'}
    elif km_availiable <= (route_km + 5):
        return {'value': 'True'}
    else: 
        return {'value': 'False'}

@app.route("/array_object", methods=['POST', 'GET'])
def array_object():
    gas_station_list.clear()
    lists = request.get_json()
    for item in lists:
        gas_station_list.append(item['name'] + ' ' +  item['address'])
    print(gas_station_list)
    prediction()
    return render_template('map.html')

@app.route("/post_list", methods=['POST', 'GET'])
def post_list():
    print(km_availiable)
    global first_time
    global need_gas
    global verdict
    if first_time == True and need_gas == True:
        final_list = [
            {'index': first_option, 'price': first_option_gas, 'verdict': verdict}, 
            {'index': second_option, 'price': second_option_gas},
            {'index': third_option, 'price': third_option_gas},
            {'index': fourth_option, 'price': fourth_option_gas},
            {'index': fifth_option, 'price': fifth_option_gas}
            ]
        if len(final_list) > 0:
            first_time = False
        return final_list
    elif need_gas == False:
        return {'verdict': verdict}
    else:
        return jibergr

def prediction():
    import stock
    global verdict
    global need_gas
    if km_availiable <= (route_km + 5):   
        verdict = 'Fill gas nearby'
        scrape()
        print_options()

    if (route_km + 5) <= km_availiable <= (route_km * 2 + 5):
        verdict = 'Fill gas anywhere along route'
        scrape()
        print_options()


    if (route_km * 2 + 5) < km_availiable:
        print(route_km * 2 + 5)
        stock.predict_stock()
        prediction = stock.difference

        if  prediction <= -0.5: 
            need_gas = False
            prediction = round(prediction, 1)
            decimal = prediction % 1
            if decimal == 0.5:
                prediction -= 0.5
            else:
                round(prediction)
            verdict = (f'Gas prices will decrease by around {(prediction)} cent(s) tomorrow, wait till tomorrow to fill gas')

        elif prediction >= 0.5:
            prediction = round(prediction, 1)
            decimal = prediction % 1
            if decimal == 0.5:
                prediction += 0.5
            else:
                round(prediction)
            verdict = (f'Gas prices will increase by around {(prediction)} cent(s) tomorrow, fill gas anywhere along the route')
            scrape()
            print_options()

        else:
            if (route_km * 4 + 5) <= km_availiable:
                verdict = ('Gas prices will stay the same tomorrow, it is recomended to wait till tomorrow, but can fill today.')
                scrape()
                print_options()
            else:
                verdict = ('Gas prices will stay the same tomorrow, it is recomended to fill today.')
                scrape()
                print_options()

def print_options():
    print('your options are:')
    print(f'{first_option} for around {first_option_gas}')
    print(f'{second_option} for around {second_option_gas}')
    print(f'{third_option} for around {third_option_gas}')
    print(f'{fourth_option} for around {fourth_option_gas}')
    print(f'{fifth_option} for around {fifth_option_gas}')

def scrape():
    global need_gas
    need_gas = True
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
    import webscrape
    webscrape.gas_buddy_search(gas_station_list, fuel_type)
    first_option = webscrape.first_option
    second_option = webscrape.second_option
    third_option = webscrape.third_option
    fourth_option = webscrape.fourth_option
    fifth_option = webscrape.fifth_option
    first_option_gas = webscrape.first_option_gas
    second_option_gas = webscrape.second_option_gas
    third_option_gas = webscrape.third_option_gas
    fourth_option_gas = webscrape.fourth_option_gas
    fifth_option_gas = webscrape.fifth_option_gas
    global first_time
    first_time = True
