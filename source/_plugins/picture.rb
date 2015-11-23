# Title: Jekyll Picture Tag
# Authors: David Rapson : @davidrapson
# Description: Easy responsive images for Jekyll.
# Based on: https://github.com/robwierzbowski/jekyll-picture-tag
#
# Syntax:  {% picture [preset] path/to/img.jpg [source_key: path/to/alt-img.jpg] [attr="value"] %}

require_relative 'imagegen'

module Jekyll

  class Picture < Liquid::Tag

    def initialize(tag_name, markup, tokens)
      @markup = markup
      super
    end

    def render(context)

      # Render any liquid variables in tag arguments and unescape template code
      render_markup = Liquid::Template.parse(@markup).render(context).gsub(/\\\{\\\{|\\\{\\%/, '\{\{' => '{{', '\{\%' => '{%')

      # Gather settings
      site = context.registers[:site]
      settings = site.config['picture']
      markup = /^(?:(?<preset>[^\s.:\/]+)\s+)?(?<image_src>[^\s]+\.[a-zA-Z0-9]{3,4})\s*(?<source_src>(?:(source_[^\s.:\/]+:\s+[^\s]+\.[a-zA-Z0-9]{3,4})\s*)+)?(?<html_attr>[\s\S]+)?$/.match(render_markup)
      preset = settings['presets'][ markup[:preset] ] || settings['presets']['default']
      url_base = ''

      raise %{
        Picture Tag can't read this tag.
        Try {% picture [preset] path/to/img.jpg [source_key: path/to/alt-img.jpg] [attr=\"value\"] %}."
      } unless markup

      # Assign defaults
      settings['source'] ||= '.'
      settings['output'] ||= 'generated'
      settings['markup'] ||= 'picture'

      # Prevent Jekyll from erasing our generated files
      site.config['keep_files'] << settings['output'] unless site.config['keep_files'].include?(settings['output'])

      # Deep copy preset for single instance manipulation
      instance = Marshal.load(Marshal.dump(preset))

      # Process alternate source images
      source_src = if markup[:source_src]
        Hash[ *markup[:source_src].gsub(/:/, '').split ]
      else
        {}
      end

      # Process html attributes
      html_attr = if markup[:html_attr]
        Hash[ *markup[:html_attr].scan(/(?<attr>[^\s="]+)(?:="(?<value>[^"]+)")?\s?/).flatten ]
      else
        {}
      end

      if instance['attr']
        html_attr = instance.delete('attr').merge(html_attr)
      end

      html_attr_string = html_attr.inject('') { |string, attrs|
        string << (attrs[1]) ? "#{attrs[0]}=\"#{attrs[1]}\" " : "#{attrs[0]} "
      }

      # Switch width and height keys to the symbols that ImageGen#generate() expects
      instance.each { |key, source|
        raise "Preset #{key} is missing a width or a height" if !source['width'] and !source['height']
        instance[key][:width] = instance[key].delete('width') if source['width']
        instance[key][:height] = instance[key].delete('height') if source['height']
      }

      # Store keys in an array for ordering the instance sources
      source_keys = instance.keys

      # Raise some exceptions before we start expensive processing
      raise %{
        Picture Tag can't find the \"#{markup[:preset]}\" preset.
        Check picture: presets in _config.yml for a list of presets."
      } unless preset

      raise %{
        Picture Tag can't find this preset source.
        Check picture: presets: #{markup[:preset]} in _config.yml for a list of sources."
      } unless (source_src.keys - source_keys).empty?

      # Process instance
      # Add image paths for each source
      instance.each_key { |key|
        instance[key][:src] = source_src[key] || markup[:image_src]
      }

      # Generate resized images
      instance.each { |key, source|
        instance[key][:generated_src] = ImageGen.generate(source, site.source, site.dest, settings['source'], settings['output'], site.config["baseurl"])
      }

      sizes = []
      source_keys.each { |source|
        sizes.push "#{url_base}#{instance[source][:generated_src]} #{instance[source][:width]}w" if source != "source_default"
      }

      extra_attrs = %{ srcset="#{sizes.join(', ')}" }

      tag = %{
        <img
          src="#{url_base}#{instance['source_default'][:generated_src]}"
          sizes="100vw"
          #{extra_attrs}
          #{html_attr_string}
        />
      }

      return tag

    end

  end
end

Liquid::Template.register_tag('picture', Jekyll::Picture)
