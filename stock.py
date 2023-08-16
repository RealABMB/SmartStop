from datetime import datetime, timedelta
def predict_stock():
    current_day = datetime.now() 
    dt = current_day + timedelta(1)
    dayofweek = dt.weekday()
    print(f'day of week is {dayofweek}')

    if dayofweek == 6 or dayofweek == 0:
        global difference
        difference = 0
    else:
        import requests
        from bs4 import BeautifulSoup
        headers = {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:76.0) Gecko/20100101 Firefox/76.0'}
        values = []

        response = requests.get(f'https://www.marketwatch.com/investing/future/cl.1/download-data?mod=mw_quote_tab', headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        date_shown = soup.find_all("div", {'class': 'cell__content u-secondary'}, limit=1)
        prices = soup.find_all("td", {'class': 'overflow__cell'}, limit=15)
        date_shown = (date_shown[0].text)
        date_shown = datetime.strptime(date_shown, '%m/%d/%Y').date()

        for objects in prices:
            values.append(objects.text)

        if date_shown == current_day.date():
            value_1 = values[14]
            value_2 = values[9]
        else:
            value_1 = values[9]
            value_2 = values[4]

        value_1 = value_1.split('$', 1)[1]
        value_2 = value_2.split('$', 1)[1]
        value_1 = float(value_1)
        value_2 = float(value_2)
        print(value_1, value_2)

        difference = (value_2 - value_1)
    print(difference)
