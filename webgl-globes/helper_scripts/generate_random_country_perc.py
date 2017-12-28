#!/usr/bin/env python3

import argparse
import random



def main():

    args = parse_arguments()

    countries = read_countries(args.country_list)
    country_val_dict = assign_country_values(countries, args.min, args.max)
    write_country_val(country_val_dict, args.output_path)
    

def read_countries(countries_path):

    countries = list()
    with open(countries_path) as in_fh:
        for line in in_fh:
            line = line.rstrip()
            countries.append(line)
    return countries


def assign_country_values(countries, min_val, max_val):

    country_val_dict = dict()

    for country in countries:
        val = random.randrange(min_val, max_val+1)
        country_val_dict[country] = val
    return country_val_dict


def write_country_val(count_val_dict, out_fp):

    with open(out_fp, 'w') as out_fh:
        for country in count_val_dict:
            country_val = count_val_dict[country]
            print('{}\t{}'.format(country, country_val), file=out_fh)
    print('{} countries with values written to {}'.format(len(count_val_dict.keys()), out_fp))


def parse_arguments():

    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--country_list', required=True)
    parser.add_argument('-o', '--output_path', required=True)
    parser.add_argument('--min', type=int, default=0)
    parser.add_argument('--max', type=int, default=100)
    args = parser.parse_args()
    return args


if __name__ == '__main__':
    main()

