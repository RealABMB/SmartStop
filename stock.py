from datetime import datetime, timedelta
def predict_stock():
    current_day = datetime.now() 
    print(current_day)
    dt = current_day + timedelta(1)
    dayofweek = dt.weekday()
    print(f'day of week is {dayofweek}')

    if dayofweek == 0 or dayofweek == 1:
        global difference
        difference = 0
    else:
        import requests
        from bs4 import BeautifulSoup
        headers = {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:76.0) Gecko/20100101 Firefox/76.0'}
        values = []

        response = requests.get(f'https://finance.yahoo.com/quote/CL%3DF/history', headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        content = soup.find_all("td", {'class': 'svelte-ta1t6m'}, limit=20)
        date_shown = (content[0].text)
        date_shown = date_shown.replace(',', '')
        date_shown = datetime.strptime(date_shown, '%b %d %Y').date()

        for objects in content:
            values.append(objects.text)

        if date_shown == current_day.date():
            value_1 = values[19]
            value_2 = values[12]
        else:
            value_1 = values[12]
            value_2 = values[5]

        #value_1 = value_1.split('$', 1)[1]
        #value_2 = value_2.split('$', 1)[1]
        value_1 = float(value_1)
        value_2 = float(value_2)
        print(value_1, value_2)

        difference = (value_2 - value_1)
    print(difference)
