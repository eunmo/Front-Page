use LWP::Simple;
use feature 'unicode_strings';
use utf8;
use Encode;
use Mojo::DOM;
use Mojo::Collection;
use DateTime;
binmode(STDOUT, ":utf8");

my $date = $ARGV[0];
my $url = "http://www.asahi.com/shimen/$date/index_tokyo_list.html";
my $html = get("$url");
my $dom = Mojo::DOM->new($html);

my $json = "[";
my $count = 0;

for my $li ($dom->find('div[id="page1"] li')->each) {
	my $class = $li->attr('class');
	next if $class =~ 'HeadlineImage';

	my $a = $li->find('a')->first;
	my $href = $a->attr('href');
	my $title = $a->all_text;
	next if $title =~ '^折々のことば';

	$json .= "," if $count++;
	$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
}

$json .= "]";
print $json;
