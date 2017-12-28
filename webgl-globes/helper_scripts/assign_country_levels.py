#!/usr/bin/env python3

import argparse
import json



def main():

    args = parse_arguments()

    country_vals_dict = parse_vals(args.country_vals)
    country_json = parse_json(args.country_json)
    country_json_w_vals = assign_vals_to_json(country_json, country_vals_dict)
    output_json(country_json_w_vals, args.annotated_json)
    print('Annotated JSON written to {}'.format(args.annotated_json))


def parse_vals(country_vals_fp):
    
    country_vals_dict = dict()

    with open(country_vals_fp) as in_fh:
        for line in in_fh:
            line = line.rstrip()
            vals = line.split('\t')
            country = vals[0]
            value = vals[1]
            country_vals_dict[country] = value
    return country_vals_dict


def parse_json(json_fp):
    
    json_data = json.load(open(json_fp))
    return json_data


def assign_vals_to_json(json_obj_raw, country_vals_dict):

    json_obj = json_obj_raw.copy()
    sub_obj = json_obj["objects"]["countries"]["geometries"]
    nbr_countries = len(sub_obj)

    for i in range(nbr_countries):
        country_obj = sub_obj[i]
        country = country_obj["id"]

        if country_vals_dict.get(country) is not None:
            country_val = country_vals_dict[country]
        else:
            country_val = 0
        country_obj["value"] = country_val

    return json_obj


def output_json(json_obj, out_fp):
    
    with open(out_fp, 'w') as outfile:
        json.dump(json_obj, outfile)


def parse_arguments():

    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--country_vals', required=True)
    parser.add_argument('-j', '--country_json', required=True)
    parser.add_argument('-o', '--annotated_json', required=True)
    args = parser.parse_args()
    return args


if __name__ == '__main__':
    main()

